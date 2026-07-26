const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/students
// @access  Public
const getStudents = async (req, res, next) => {
    try {
        const students = await Student.find()
            .populate('userId', 'firstName lastName profilePicture username email')
            .sort({ createdAt: -1 });
        res.status(200).json(students);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Public
const getStudentById = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('userId', 'firstName lastName profilePicture username email');
        if (!student) {
            res.status(404);
            throw new Error('Student not found');
        }
        res.status(200).json(student);
    } catch (error) {
        next(error);
    }
};

// @desc    Add new student
// @route   POST /api/students
// @access  Public
const addStudent = async (req, res, next) => {
    try {
        const { name, email, studentMobile, parentMobile, grade, status, username, password } = req.body;

        const studentExists = await Student.findOne({ email });
        if (studentExists) {
            res.status(400);
            throw new Error('Student with this email already exists');
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            res.status(400);
            throw new Error('User account with this email already exists');
        }

        let studentId = undefined;
        if (username && username.trim()) {
            const normalizedUsername = username.trim().toLowerCase();
            
            // Check User collection
            const usernameExists = await User.findOne({ username: normalizedUsername });
            if (usernameExists) {
                res.status(400);
                throw new Error('Username is already taken');
            }

            // Check Student collection
            const customStudentId = username.trim().toUpperCase();
            const studentIdExists = await Student.findOne({ studentId: customStudentId });
            if (studentIdExists) {
                res.status(400);
                throw new Error('Student ID / Username is already taken');
            }

            studentId = customStudentId;
        }

        // Split name for User creation
        const nameParts = name ? name.trim().split(/\s+/) : ['Student'];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Create the User account first so we get the _id
        const usernameLower = studentId ? studentId.toLowerCase() : email.split('@')[0].toLowerCase();
        const userPassword = (password && password.trim()) ? password.trim() : `${usernameLower}123`;

        const user = await User.create({
            username: usernameLower,
            email: email.toLowerCase(),
            password: userPassword,
            role: 'student',
            firstName,
            lastName
        });

        // Create the Student record linked to the User
        const student = await Student.create({
            userId: user._id,
            name,
            email,
            studentMobile,
            parentMobile,
            grade: 'Grade 10', // Enforce Grade 10
            status,
            ...(studentId && { studentId })
        });

        res.status(201).json(student);
    } catch (error) {
        next(error);
    }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Public
const updateStudent = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            res.status(404);
            throw new Error('Student not found');
        }

        // Destructure to remove _id and immutable fields from update payload
        const { _id, username, password, ...updateData } = req.body;

        // Auto-format phone numbers if provided (Single standard format: 07X XXX XXXX)
        const formatLKPhone = (phone) => {
            if (!phone || typeof phone !== 'string') return phone;
            let digits = phone.trim().replace(/\D/g, '');
            if (digits.startsWith('94') && digits.length === 11) {
                digits = '0' + digits.substring(2);
            } else if (!digits.startsWith('0') && digits.length === 9) {
                digits = '0' + digits;
            }
            if (/^07\d{8}$/.test(digits)) {
                return `${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
            }
            return phone.trim();
        };

        if (updateData.studentMobile !== undefined) {
            updateData.studentMobile = formatLKPhone(updateData.studentMobile);
        }
        if (updateData.parentMobile !== undefined) {
            updateData.parentMobile = formatLKPhone(updateData.parentMobile);
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: { ...updateData, grade: 'Grade 10' } },
            { new: true, runValidators: true }
        );

        // Update the linked User record via userId reference
        if (updatedStudent && updatedStudent.userId) {
            const user = await User.findById(updatedStudent.userId);
            if (user) {
                if (updatedStudent.email) {
                    user.email = updatedStudent.email.toLowerCase();
                }
                if (updatedStudent.name) {
                    const nameParts = updatedStudent.name.trim().split(/\s+/);
                    user.firstName = nameParts[0] || '';
                    user.lastName = nameParts.slice(1).join(' ') || '';
                }
                await user.save();
            }
        } else if (updatedStudent && !updatedStudent.userId) {
            // Legacy student without userId — try to find and link the User
            const searchUsername = updatedStudent.studentId ? updatedStudent.studentId.toLowerCase() : '';
            const user = await User.findOne({
                $or: [
                    ...(searchUsername ? [{ username: searchUsername }] : []),
                    { email: updatedStudent.email.toLowerCase() }
                ]
            });

            if (user) {
                updatedStudent.userId = user._id;
                await updatedStudent.save();

                if (updatedStudent.email) {
                    user.email = updatedStudent.email.toLowerCase();
                }
                if (updatedStudent.name) {
                    const nameParts = updatedStudent.name.trim().split(/\s+/);
                    user.firstName = nameParts[0] || '';
                    user.lastName = nameParts.slice(1).join(' ') || '';
                }
                await user.save();
            }
        }

        res.status(200).json(updatedStudent);
    } catch (error) {
        console.error('Error updating student:', error);
        next(error);
    }
};

// @desc    Soft Delete student (Set status to Inactive)
// @route   DELETE /api/students/:id
// @access  Public
const deleteStudent = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            res.status(404);
            throw new Error('Student not found');
        }

        student.status = 'Inactive';
        const updatedStudent = await student.save();

        // Delete the linked User via userId reference
        if (student.userId) {
            await User.deleteOne({ _id: student.userId });
            console.log(`Deleted User record for inactive student ${student.studentId}`);
        } else if (student.studentId) {
            // Fallback for legacy students without userId
            await User.deleteOne({ username: student.studentId.toLowerCase() });
            console.log(`Deleted User record (by username) for inactive student ${student.studentId}`);
        }

        res.status(200).json(updatedStudent);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStudents,
    getStudentById,
    addStudent,
    updateStudent,
    deleteStudent
};
