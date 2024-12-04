import React from 'react';
import { MdTravelExplore, MdOutlineLocationOn, MdOutlineDateRange } from 'react-icons/md';

const EmptyCard = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center justify-center w-96 h-96 text-center bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center gap-4 mb-6 text-gray-400">
                    <MdTravelExplore className="w-16 h-16" />
                    <MdOutlineLocationOn className="w-16 h-16" />
                    <MdOutlineDateRange className="w-16 h-16" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                    Your Travel Journal is Empty
                </h2>
                <p className="text-gray-500 mb-6 max-w-sm">
                    Start exploring new destinations and save your memorable experiences here.
                </p>
                <p className="text-gray-400 italic text-sm">
                    "Life is a journey, not a destination."
                </p>
            </div>
        </div>
    );
};

export default EmptyCard;
