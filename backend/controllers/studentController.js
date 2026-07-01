const Student = require('../models/Student');
const User = require('../models/User');

// Helper to synchronize Student and User tables, and enforce Grade 10 on all students
const syncStudentsAndUsers = async () => {
    try {
        // Enforce Grade 10 on all existing students first
        await Student.updateMany({ grade: { $ne: 'Grade 10' } }, { $set: { grade: 'Grade 10' } });

        const users = await User.find({ role: 'student' });
        const students = await Student.find();

        const studentEmails = new Set(students.map(s => s.email ? s.email.toLowerCase() : '').filter(Boolean));
        const studentIds = new Set(students.map(s => s.studentId ? s.studentId.toLowerCase() : '').filter(Boolean));

        // 1. Sync User -> Student (Create missing Student records)
        for (const user of users) {
            const userEmailLower = user.email ? user.email.toLowerCase() : '';
            const usernameLower = user.username ? user.username.toLowerCase() : '';
            
            if (userEmailLower && usernameLower && !studentEmails.has(userEmailLower) && !studentIds.has(usernameLower)) {
                const nameParts = [user.firstName, user.lastName].filter(Boolean);
                const fullName = nameParts.join(' ').trim() || user.username;
                
                await Student.create({
                    studentId: user.username.toUpperCase(),
                    name: fullName,
                    email: user.email,
                    studentMobile: 'N/A',
                    parentMobile: 'N/A',
                    grade: 'Grade 10', // Enforce Grade 10
                    status: 'Active'
                });
                console.log(`Synced: Created Student record for user ${user.username}`);
            }
        }

        // Re-fetch students to capture newly created ones
        const updatedStudents = await Student.find();
        
        // Build in-memory maps of users for fast lookups
        const userByUsername = new Map();
        const userByEmail = new Map();
        for (const u of users) {
            if (u.username) userByUsername.set(u.username.toLowerCase(), u);
            if (u.email) userByEmail.set(u.email.toLowerCase(), u);
        }

        // 2. Sync Student -> User (Create missing User accounts, or update details if out of sync)
        for (const student of updatedStudents) {
            const studentEmailLower = student.email ? student.email.toLowerCase() : '';
            const studentIdLower = student.studentId ? student.studentId.toLowerCase() : '';

            if (!studentIdLower || !studentEmailLower) continue;

            // Find matching user from in-memory maps
            const user = userByUsername.get(studentIdLower) || userByEmail.get(studentEmailLower);

            if (!user) {
                // Create missing User record
                const nameParts = student.name ? student.name.trim().split(/\s+/) : ['Student'];
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                await User.create({
                    username: studentIdLower,
                    email: student.email.toLowerCase(),
                    password: `${studentIdLower}123`, // Default password
                    role: 'student',
                    firstName,
                    lastName
                });
                console.log(`Synced: Created User record for student ${student.studentId}`);
            } else {
                // If user exists, make sure details are synced
                let modified = false;
                if (user.username !== studentIdLower) {
                    user.username = studentIdLower;
                    modified = true;
                }
                if (user.email !== studentEmailLower) {
                    user.email = studentEmailLower;
                    modified = true;
                }
                const nameParts = student.name ? student.name.trim().split(/\s+/) : ['Student'];
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';
                if (user.firstName !== firstName) {
                    user.firstName = firstName;
                    modified = true;
                }
                if (user.lastName !== lastName) {
                    user.lastName = lastName;
                    modified = true;
                }
                if (modified) {
                    await user.save();
                    console.log(`Synced: Updated User details for student ${student.studentId}`);
                }
            }
        }
    } catch (error) {
        console.error('Error syncing students and users:', error);
    }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Public
const getStudents = async (req, res, next) => {
    try {
        await syncStudentsAndUsers();
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

        const student = await Student.create({
            name,
            email,
            studentMobile,
            parentMobile,
            grade: 'Grade 10', // Enforce Grade 10
            status,
            ...(studentId && { studentId })
        });

        // Split name for User creation
        const nameParts = student.name ? student.name.trim().split(/\s+/) : ['Student'];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Create the corresponding User account
        const usernameLower = student.studentId.toLowerCase();
        const userPassword = (password && password.trim()) ? password.trim() : `${usernameLower}123`;

        await User.create({
            username: usernameLower,
            email: student.email.toLowerCase(),
            password: userPassword,
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
            { ...req.body, grade: 'Grade 10' }, // Enforce Grade 10
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

        // Also delete/deactivate user from User collection to keep them synced
        if (student.studentId) {
            await User.deleteOne({ username: student.studentId.toLowerCase() });
            console.log(`Synced: Deleted User record for inactive student ${student.studentId}`);
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
