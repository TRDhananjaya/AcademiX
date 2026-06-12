const Student = require('../models/Student');

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

        const student = await Student.create({
            name,
            email,
            studentMobile,
            parentMobile,
            grade,
            status
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

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

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
