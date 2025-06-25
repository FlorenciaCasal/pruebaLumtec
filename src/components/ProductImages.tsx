'use client';

import { useState } from 'react';
import { ProductImage } from '@/types/productImage.types';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';

type Props = {
    images: ProductImage[];
    productName: string;
};

export default function ProductImages({ images, productName }: Props) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            if (selectedIndex < images.length - 1) setSelectedIndex(selectedIndex + 1);
        },
        onSwipedRight: () => {
            if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
        },
        trackMouse: true,
    });

    return (
        <div className="flex flex-col md:flex-row gap-4">
            {/* Miniaturas */}
            <div className="hidden md:flex md:flex-col gap-2 md:w-1/4 justify-around">
                {images.map((img, idx) => (
                    <img
                        key={img.id}
                        src={img.url}
                        alt={productName}
                        onClick={() => setSelectedIndex(idx)}
                        className={`cursor-pointer rounded border-2 transition-all ${selectedIndex === idx ? 'border-gray-800' : 'border-transparent'
                            } hover:opacity-80 object-cover w-full h-20`}
                    />
                ))}
            </div>

            {/* Imagen Principal */}
            <div className="md:w-3/4 w-full" {...handlers}>
                <div className="relative w-full h-[300px] md:h-[500px] rounded">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={images[selectedIndex].id}
                            src={images[selectedIndex].url}
                            alt={productName}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ scale: 1.1 }}
                            className="absolute inset-0 w-full h-full object-contain bg-white cursor-zoom-in"
                        />
                    </AnimatePresence>
                </div>
                {/* Puntitos en mobile */}
                <div className="flex md:hidden justify-center mt-3 gap-2">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedIndex(idx)}
                            className={`w-3 h-3 rounded-full ${selectedIndex === idx ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                        />
                    ))}
                </div>

                {/* Miniaturas horizontales en mobile */}
                <div className="flex md:hidden overflow-x-auto gap-2 mt-4">
                    {images.map((img, idx) => (
                        <img
                            key={img.id}
                            src={img.url}
                            alt={productName}
                            onClick={() => setSelectedIndex(idx)}
                            className={`cursor-pointer rounded border-2 flex-shrink-0 w-20 h-20 object-cover ${selectedIndex === idx ? 'border-blue-500' : 'border-transparent'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

