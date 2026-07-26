const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        sparse: true
    },
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
        trim: true,
        default: ''
    },
    parentMobile: {
        type: String,
        trim: true,
        default: ''
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

    // Standardize Sri Lankan phone numbers to single standard format: 07X XXX XXXX
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

    if (this.studentMobile) {
        this.studentMobile = formatLKPhone(this.studentMobile);
    }
    if (this.parentMobile) {
        this.parentMobile = formatLKPhone(this.parentMobile);
    }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
