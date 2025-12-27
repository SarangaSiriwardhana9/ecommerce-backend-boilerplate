import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class Address {
    @Prop({ type: Types.ObjectId, auto: true })
    _id: Types.ObjectId;

    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    addressLine1: string;

    @Prop()
    addressLine2: string;

    @Prop({ required: true })
    city: string;

    @Prop({ required: true })
    state: string;

    @Prop({ required: true })
    postalCode: string;

    @Prop({ required: true })
    country: string;

    @Prop({ default: false })
    isDefault: boolean;

    @Prop({ enum: ['shipping', 'billing', 'both'], default: 'both' })
    type: string;
}

@Schema({ _id: false })
export class UserPreferences {
    @Prop({ default: false })
    newsletter: boolean;

    @Prop({ default: false })
    smsNotifications: boolean;

    @Prop({ default: 'USD' })
    currency: string;

    @Prop({ default: 'en' })
    language: string;
}

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true, select: false })
    password: string;

    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop()
    phone: string;

    @Prop({ enum: ['customer', 'admin', 'super_admin'], default: 'customer' })
    role: string;

    @Prop({ default: false })
    isVerified: boolean;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ enum: ['local', 'google', 'facebook'], default: 'local' })
    authProvider: string;

    @Prop()
    providerId: string;

    @Prop()
    avatar: string;

    @Prop({ type: [Address], default: [] })
    addresses: Address[];

    @Prop({ type: UserPreferences, default: () => ({}) })
    preferences: UserPreferences;

    @Prop()
    resetPasswordToken: string;

    @Prop()
    resetPasswordExpires: Date;

    @Prop()
    lastLoginAt: Date;

    @Prop()
    deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
UserSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
    },
});
