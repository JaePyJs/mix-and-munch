import React, { useState } from 'react';
import { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  className?: string;
}

const NavLink: React.FC<{
  page: Page;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ page, currentPage, setCurrentPage, children, onClick }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => {
        setCurrentPage(page);
        onClick?.();
      }}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors w-full md:w-auto text-left md:text-center ${
        isActive
          ? 'bg-brand-lime text-brand-gray-900'
          : 'text-brand-gray-200 hover:bg-brand-gray-800 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, className }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={`bg-brand-gray-900/80 backdrop-blur-sm sticky top-0 z-40 border-b border-brand-gray-800 ${className || ''}`}>
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div 
          className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
          onClick={() => {
            setCurrentPage('home');
            setMobileMenuOpen(false);
          }}
        >
          <svg className="w-8 h-8 text-brand-lime" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.5 13.5H13.5V16.5H10.5V13.5H7.5V10.5H10.5V7.5H13.5V10.5H16.5V13.5Z" fill="currentColor"/>
          </svg>
          <span className="text-xl md:text-2xl font-bold text-white">
            Mix<span className="text-brand-lime">&</span>Munch
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          <NavLink page="home" currentPage={currentPage} setCurrentPage={setCurrentPage}>Home</NavLink>
          <NavLink page="demo" currentPage={currentPage} setCurrentPage={setCurrentPage}>Recipes</NavLink>
          <NavLink page="meal-planner" currentPage={currentPage} setCurrentPage={setCurrentPage}>Meal Planner</NavLink>
          <NavLink page="shopping-list" currentPage={currentPage} setCurrentPage={setCurrentPage}>Shopping List</NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-md hover:bg-brand-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          <div className={`w-6 h-0.5 bg-brand-lime transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-brand-lime my-1.5 transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-brand-lime transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-gray-800/95 border-t border-brand-gray-700 px-4 py-2 space-y-2">
          <NavLink 
            page="home" 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink 
            page="demo" 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            onClick={() => setMobileMenuOpen(false)}
          >
            Recipes
          </NavLink>
          <NavLink 
            page="meal-planner" 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            onClick={() => setMobileMenuOpen(false)}
          >
            Meal Planner
          </NavLink>
          <NavLink 
            page="shopping-list" 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            onClick={() => setMobileMenuOpen(false)}
          >
            Shopping List
          </NavLink>
        </div>
      )}
    </header>
  );
};

export default Header;