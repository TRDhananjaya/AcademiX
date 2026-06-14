const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    studentMobile: {
        type: String,
        required: true,
        trim: true
    },
    parentMobile: {
        type: String,
        required: true,
        trim: true
    },
    grade: {
        type: String,
        required: true,
        enum: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11']
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'At Risk', 'Suspended', 'Inactive'],
        default: 'Active'
    },
    enrolled: {
        type: Date,
        default: Date.now
    },
    initials: {
        type: String
    },
    color: {
        type: String
    }
}, {
    timestamps: true
});

// Pre-save middleware to set initials, color, and studentId if not provided
studentSchema.pre('save', async function() {
    if (!this.studentId) {
        // Generate a random ID like STU-1005
        this.studentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
        
        // Ensure uniqueness by checking DB
        let isUnique = false;
        while (!isUnique) {
            const existingStudent = await mongoose.models.Student.findOne({ studentId: this.studentId });
            if (existingStudent) {
                this.studentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
            } else {
                isUnique = true;
            }
        }
    }

    if (this.isModified('name') || !this.initials) {
        const names = this.name.split(' ');
        this.initials = names.map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'ST';
    }
    
    if (!this.color) {
        const colors = ['bg-indigo-500', 'bg-teal-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500', 'bg-red-500', 'bg-slate-500'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
