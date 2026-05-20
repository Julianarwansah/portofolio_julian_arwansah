import React, { useState, useEffect } from 'react';
import { FiX, FiGithub, FiExternalLink } from 'react-icons/fi';

const ProjectModal = ({ isOpen, onClose, project }) => {
  // State untuk mengontrol animasi penutupan
  const [isClosing, setIsClosing] = useState(false);

  // Fungsi untuk menangani penutupan dengan animasi
  const handleClose = () => {
    setIsClosing(true);
    // Tunggu animasi selesai (300ms) sebelum memanggil onClose dari props
    setTimeout(() => {
      onClose();
      setIsClosing(false); // Reset state untuk pembukaan berikutnya
    }, 300);
  };

  // Mencegah scroll di background saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);


  if (!isOpen) return null;

  return (
    // Overlay
    <div
      onClick={handleClose}
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
    >
      {/* Modal Content */}
      <div
        onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat diklik di dalam
        className={`bg-zinc-950 border-4 border-black rounded-lg shadow-[8px_8px_0px_#ff007f] w-full max-w-lg transform transition-transform duration-300 ${isClosing ? 'animate-out' : 'animate-in'}`}
      >
        {/* --- GAMBAR PROYEK --- */}
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-56 object-cover border-b-3 border-black"
        />

        <div className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white tracking-tight">{project.title}</h2>
                <button
                    onClick={handleClose}
                    className="text-black bg-[#ffe600] border-2 border-black p-1.5 hover:bg-[#ff007f] hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_#000] -mt-2 -mr-2"
                >
                    <FiX size={20} />
                </button>
            </div>

            {/* --- DESKRIPSI LENGKAP --- */}
            <p className="text-zinc-300 text-base leading-relaxed font-medium">
                {project.fullDescription}
            </p>

            <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 neo-btn-cyan py-3 px-5 rounded-md w-full"
            >
                {project.url?.includes('github.com') ? <FiGithub /> : <FiExternalLink />}
                <span>{project.url?.includes('github.com') ? 'Source Code' : 'Visit Website'}</span>
            </a>
        </div>
      </div>
       {/* CSS untuk animasi */}
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-in {
          animation: scaleIn 0.3s ease-out forwards;
        }
        
        @keyframes scaleOut {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(0.95); opacity: 0; }
        }
        .animate-out {
          animation: scaleOut 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default ProjectModal;
