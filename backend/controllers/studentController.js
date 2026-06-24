const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/students
// @access  Public
const getStudents = async (req, res, next) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
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
        const student = await Student.findById(req.params.id);
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
        const { name, email, studentMobile, parentMobile, grade, status } = req.body;

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

        const student = await Student.create({
            name,
            email,
            studentMobile,
            parentMobile,
            grade,
            status
        });

        // Split name for User creation
        const nameParts = student.name ? student.name.trim().split(/\s+/) : ['Student'];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Create the corresponding User account
        const usernameLower = student.studentId.toLowerCase();
        await User.create({
            username: usernameLower,
            email: student.email.toLowerCase(),
            password: `${usernameLower}123`, // Default password is username + '123' (e.g. stu-1234123)
            role: 'student',
            firstName,
            lastName
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

        const oldEmail = student.email;
        const oldStudentId = student.studentId;

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (updatedStudent) {
            const searchUsername = (oldStudentId || updatedStudent.studentId).toLowerCase();
            const user = await User.findOne({
                $or: [
                    { username: searchUsername },
                    { email: oldEmail.toLowerCase() }
                ]
            });

            if (user) {
                if (updatedStudent.studentId) {
                    user.username = updatedStudent.studentId.toLowerCase();
                }
                if (updatedStudent.email) {
                    user.email = updatedStudent.email.toLowerCase();
                }
                if (updatedStudent.name) {
                    const nameParts = updatedStudent.name.trim().split(/\s+/);
                    user.firstName = nameParts[0] || '';
                    user.lastName = nameParts.slice(1).join(' ') || '';
                }
                await user.save();
            } else {
                // If user didn't exist for some reason (e.g. wasn't migrated), create it
                const nameParts = updatedStudent.name ? updatedStudent.name.trim().split(/\s+/) : ['Student'];
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';
                await User.create({
                    username: updatedStudent.studentId.toLowerCase(),
                    email: updatedStudent.email.toLowerCase(),
                    password: `${updatedStudent.studentId.toLowerCase()}123`,
                    role: 'student',
                    firstName,
                    lastName
                });
            }
        }

        res.status(200).json(updatedStudent);
    } catch (error) {
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
