'use client';
import { useState } from 'react';
import { ProductImage } from '@/types/productImage.types';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

type Props = {
    images: ProductImage[];
    productName: string;
};

export default function ProductImages({ images, productName }: Props) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [open, setOpen] = useState(false);

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
        <>
            <div className="flex flex-col md:flex-row gap-4">
                {/* Miniaturas laterales en desktop */}
                <div className="hidden md:flex md:flex-col gap-2 md:w-1/4 justify-around">
                    {images.map((img, idx) => (
                        <div
                            key={img.id}
                            onClick={() => setSelectedIndex(idx)}
                            className={`cursor-pointer rounded border-2 transition-all relative w-full h-20 ${selectedIndex === idx ? 'border-gray-800' : 'border-transparent'} hover:opacity-80`}
                        >
                            <Image src={img.url} alt={productName} fill className="object-cover rounded" />
                        </div>
                    ))}
                </div>

                {/* Imagen principal */}
                <div className="md:w-3/4 w-full" {...handlers}>
                    <div
                        className="relative w-full h-[300px] md:h-[500px] rounded cursor-zoom-in"
                        onClick={() => setOpen(true)}
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={images[selectedIndex].id}
                                src={images[selectedIndex].url}
                                alt={productName}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 w-full h-full object-contain bg-white"
                            />
                        </AnimatePresence>
                    </div>

                    {/* Puntitos en mobile */}
                    <div className="flex md:hidden justify-center mt-3 gap-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedIndex(idx)}
                                className={`w-3 h-3 rounded-full ${selectedIndex === idx ? 'bg-blue-500' : 'bg-gray-400'}`}
                            />
                        ))}
                    </div>

                    {/* Miniaturas horizontales en mobile */}
                    <div className="flex md:hidden overflow-x-auto gap-2 mt-4">
                        {images.map((img, idx) => (
                            <div
                                key={img.id}
                                onClick={() => setSelectedIndex(idx)}
                                className={`cursor-pointer rounded border-2 flex-shrink-0 w-20 h-20 relative ${selectedIndex === idx ? 'border-blue-500' : 'border-transparent'}`}
                            >
                                <Image src={img.url} alt={productName} fill className="object-cover rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lightbox fullscreen con zoom y thumbnails */}
            <Lightbox
                open={open}
                close={() => setOpen(false)}
                index={selectedIndex}
                slides={images.map((img) => ({ src: img.url }))}
                plugins={[Zoom, Thumbnails]}
                styles={{ container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' } }}
                animation={{ fade: 300 }}
            />
        </>
    );
}



