import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, NewspaperIcon, BookmarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, NewspaperIcon as NewspaperIconSolid, 
         BookmarkIcon as BookmarkIconSolid, UserIcon as UserIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';

/**
 * Bottom tab navigation component
 * @returns {JSX.Element} Navigation component
 */
function Navigation() {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Define navigation items
  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: location.pathname === '/' ? <HomeIconSolid className="w-5 h-5" /> : <HomeIcon className="w-5 h-5" />,
    },
    {
      name: 'Latest',
      path: '/latest',
      icon: location.pathname === '/latest' ? <NewspaperIconSolid className="w-5 h-5" /> : <NewspaperIcon className="w-5 h-5" />,
    }
  ];
  
  // Add bookmarks and profile if user is logged in
  if (currentUser) {
    navItems.push(
      {
        name: 'Bookmarks',
        path: '/bookmarks',
        icon: location.pathname === '/bookmarks' ? <BookmarkIconSolid className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />,
      },
      {
        name: 'Profile',
        path: '/profile',
        icon: location.pathname === '/profile' ? <UserIconSolid className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />,
      }
    );
  } else {
    navItems.push(
      {
        name: 'Login',
        path: '/login',
        icon: location.pathname === '/login' ? <UserIconSolid className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />,
      }
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              location.pathname === item.path
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-primary-600'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-0.5">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navigation;