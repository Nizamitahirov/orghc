// components/orgChart/Avatar.jsx
'use client'
import React from 'react';
import { AlertCircle } from 'lucide-react';

 const Avatar = ({ employee, size = 'md', darkMode = false }) => {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-sm',
        lg: 'w-16 h-16 text-base',
    };

    if (!employee) {
        return <div className={`${sizes[size]} rounded-xl bg-gray-300 animate-pulse`}></div>;
    }
    
    const isVacant = employee.vacant;
    
    // Vacant position avatar
    if (isVacant) {
        return (
            <div 
                className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold text-white relative flex-shrink-0 ring-2 ring-red-300 shadow-lg`}
                style={{ 
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                }}
            >
                <AlertCircle className="w-5 h-5" />
            </div>
        );
    }
    
    // Employee with profile image
    if (employee.profile_image_url) {
        return (
            <img
                src={employee.profile_image_url}
                alt={employee.name}
                className={`${sizes[size]} rounded-xl object-cover ring-2 ring-white shadow-lg flex-shrink-0`}
            />
        );
    }
    
    // Hierarchy colors - Almet color palette
    const hierarchyColors = {
        'VC': { primary: darkMode ? '#4e7db5' : '#30539b', badge: darkMode ? '#30539b' : '#253360' },
        'DIRECTOR': { primary: darkMode ? '#336fa5' : '#2d5a91', badge: darkMode ? '#2d5a91' : '#336fa5' },
        'HEAD OF DEPARTMENT': { primary: darkMode ? '#38587d' : '#253360', badge: darkMode ? '#253360' : '#38587d' },
        'SENIOR SPECIALIST': { primary: darkMode ? '#7a829a' : '#4f5772', badge: darkMode ? '#4f5772' : '#7a829a' },
        'SPECIALIST': { primary: darkMode ? '#90a0b9' : '#7a829a', badge: darkMode ? '#7a829a' : '#90a0b9' },
        'JUNIOR SPECIALIST': { primary: darkMode ? '#9c9cb5' : '#7a829a', badge: darkMode ? '#7a829a' : '#9c9cb5' },
        'Vice Chairman': { primary: darkMode ? '#2346A8' : '#30539b', badge: darkMode ? '#253360' : '#2346A8' }
    };

    const getEmployeeColor = (employee) => {
        if (!employee || !employee.position_group) return hierarchyColors['SPECIALIST'];
        return hierarchyColors[employee.position_group] || hierarchyColors['SPECIALIST'];
    };

    const colors = getEmployeeColor(employee);
    const initials = employee.avatar || employee.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';
    
    return (
        <div 
            className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold text-white relative flex-shrink-0 ring-2 ring-white shadow-lg`}
            style={{ 
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.badge} 100%)`,
            }}
        >
            {initials}
        </div>
    );
};

export default Avatar;