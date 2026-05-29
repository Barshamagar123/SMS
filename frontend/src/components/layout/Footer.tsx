import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t py-3 px-6 text-center text-gray-500 text-sm">
      &copy; {new Date().getFullYear()} EduManage. All rights reserved.
    </footer>
  );
};

export default Footer;