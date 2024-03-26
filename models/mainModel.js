import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        college: {
            type: String,
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            default: 'user'
        },
    },
    {
        timestamps: true,
    }
);

// Hashing the password before saving it to the database
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
});

// Create models based on the schemas
export const User = mongoose.model('User', userSchema);

const internshipSchema = new mongoose.Schema({
    internship_name: {
        type: String,
        required: true,
    },
    internship_url: {
        type: String,
        required: true,
    },
    heading_url: {
        type: String,
        requird: true,
    },
    company_name: {
        type: String,
        required: true,
    },
    stipend: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    apply_by: {
        type: String,
        required: true,
    },
    img_link: {
        type: String,
    },
    about_company: {
        type: String,
        required: true,
    },
    more_about: {
        type: String,
    },
    who_can_apply: {
        type: String,
    },
    activities: {
        type: [String],
    },
    skills: {
        type: [String],
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
},
    {
        timestamps: true,
    }
);

export const Internship = mongoose.model('Internship', internshipSchema);
