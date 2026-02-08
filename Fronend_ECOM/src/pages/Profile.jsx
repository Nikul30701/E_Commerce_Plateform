import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { User, Lock, Save, Camera, Mail, Phone, ChevronRight } from 'lucide-react';

const Profile = () => {
    const { user, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [isActiveTab, setIsActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        profile_pic: null,
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                first_name: user?.first_name || '',
                last_name: user?.last_name || '',
                phone_number: user?.phone_number || '',
                profile_pic: user?.profile_pic
            });
        }
    }, [user]);

    const handleProfileChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('first_name', profileData.first_name);
        formData.append('last_name', profileData.last_name);
        formData.append('phone_number', profileData.phone_number);
        if (profileData.profile_pic instanceof File) {
            formData.append('profile_pic', profileData.profile_pic);
        }

        try {
            const { data } = await authAPI.updateProfile(formData);
            updateUser(data.user);
            toast.success('Profile updated successfully.');
        } catch (error) {
            const errors = error.response?.data || {};
            const message = Object.values(errors).flat()[0] || 'Failed to update profile.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await authAPI.updatePassword({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            toast.success('Password updated successfully.');
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            const errors = error.response?.data || {};
            const message = Object.values(errors).flat()[0] || 'Failed to update password.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all duration-200 outline-none";
    const labelStyle = "block text-sm font-semibold text-gray-600 mb-1.5 ml-1";

    return (
        <div className='min-h-screen bg-[#f8f9fa] py-12 px-4'>
            <div className='max-w-5xl mx-auto'>
                <div className='mb-10'>
                    <h1 className='text-4xl font-extrabold text-stone-900 tracking-tight'>Settings</h1>
                    <p className='text-gray-500 mt-2'>Manage your account settings and profile preferences.</p>
                </div>

                <div className='flex flex-col md:flex-row gap-8'>
                    {/* Glass Sidebar Tabs */}
                    <div className='w-full md:w-72 space-y-2'>
                        <button
                            onClick={() => setIsActiveTab('profile')}
                            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${isActiveTab === 'profile' ? 'bg-white shadow-md text-stone-900' : 'text-gray-500 hover:bg-gray-200/50'}`}
                        >
                            <div className='flex items-center gap-3 font-bold'>
                                <User className={`h-5 w-5 ${isActiveTab === 'profile' ? 'text-stone-900' : 'text-gray-400'}`} />
                                <span>Personal Info</span>
                            </div>
                            {isActiveTab === 'profile' && <ChevronRight className="h-4 w-4" />}
                        </button>

                        <button
                            onClick={() => setIsActiveTab('password')}
                            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${isActiveTab === 'password' ? 'bg-white shadow-md text-stone-900' : 'text-gray-500 hover:bg-gray-200/50'}`}
                        >
                            <div className='flex items-center gap-3 font-bold'>
                                <Lock className={`h-5 w-5 ${isActiveTab === 'password' ? 'text-stone-900' : 'text-gray-400'}`} />
                                <span>Security</span>
                            </div>
                            {isActiveTab === 'password' && <ChevronRight className="h-4 w-4" />}
                        </button>
                    </div>

                    {/* Main Content Card */}
                    <div className='flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10'>
                        {isActiveTab === 'profile' ? (
                            <form onSubmit={handleProfileChange} className='space-y-8'>
                                {/* Avatar Upload Section */}
                                <div className='flex items-center gap-6'>
                                    <div className='relative group'>
                                        <div className='h-24 w-24 rounded-3xl overflow-hidden bg-stone-100 border-4 border-white shadow-lg'>
                                            {profileData.profile_pic ? (
                                                <img 
                                                    src={profileData.profile_pic instanceof File ? URL.createObjectURL(profileData.profile_pic) : profileData.profile_pic} 
                                                    className='h-full w-full object-cover' 
                                                    alt="Profile"
                                                />
                                            ) : (
                                                <div className='h-full w-full flex items-center justify-center text-stone-300'>
                                                    <User size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <label className='absolute -bottom-2 -right-2 p-2 bg-stone-900 text-white rounded-xl shadow-xl cursor-pointer hover:scale-110 transition-transform'>
                                            <Camera size={16} />
                                            <input 
                                                type="file" 
                                                className='hidden' 
                                                onChange={(e) => setProfileData({ ...profileData, profile_pic: e.target.files[0] })} 
                                            />
                                        </label>
                                    </div>
                                    <div>
                                        <h3 className='text-lg font-bold text-stone-800'>Profile Photo</h3>
                                        <p className='text-sm text-gray-500'>JPG, GIF or PNG. Max size of 2MB.</p>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                                    <div>
                                        <label className={labelStyle}>First Name</label>
                                        <input 
                                            type="text" 
                                            value={profileData.first_name} 
                                            onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })} 
                                            className={inputStyle} 
                                        />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Last Name</label>
                                        <input 
                                            type="text" 
                                            value={profileData.last_name} 
                                            onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })} 
                                            className={inputStyle} 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelStyle}>Email Address</label>
                                    <div className='relative'>
                                        <Mail className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5' />
                                        <input 
                                            type="email" 
                                            value={user?.email || ''} 
                                            disabled 
                                            className={`${inputStyle} pl-12 bg-gray-100 cursor-not-allowed opacity-70`} 
                                        />
                                    </div>
                                    <p className='text-[11px] text-red-400 mt-2 italic font-medium'>Email updates are disabled for security reasons.</p>
                                </div>

                                <div>
                                    <label className={labelStyle}>Phone Number</label>
                                    <div className='relative'>
                                        <Phone className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5' />
                                        <input 
                                            type="tel" 
                                            value={profileData.phone_number} 
                                            onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })} 
                                            className={`${inputStyle} pl-12`} 
                                        />
                                    </div>
                                </div>

                                <button
                                    type='submit'
                                    disabled={loading}
                                    className='w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all active:scale-95 disabled:opacity-50'
                                >
                                    <Save size={18} />
                                    {loading ? 'Saving...' : 'Save Profile'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handlePasswordChange} className='max-w-md space-y-6'>
                                <div>
                                    <label className={labelStyle}>Current Password</label>
                                    <input 
                                        type="password" 
                                        required 
                                        value={passwordData.current_password} 
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })} 
                                        className={inputStyle} 
                                    />
                                </div>
                                <div className='h-px bg-gray-100 my-2' />
                                <div>
                                    <label className={labelStyle}>New Password</label>
                                    <input 
                                        type="password" 
                                        required 
                                        value={passwordData.new_password} 
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} 
                                        className={inputStyle} 
                                    />
                                </div>
                                <div>
                                    <label className={labelStyle}>Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        required 
                                        value={passwordData.confirm_password} 
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} 
                                        className={inputStyle} 
                                    />
                                </div>

                                <button
                                    type='submit'
                                    disabled={loading}
                                    className='w-full flex items-center justify-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all active:scale-95 disabled:opacity-50'
                                >
                                    <Lock size={18} />
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;