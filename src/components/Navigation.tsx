import { useState } from 'react';
import { Menu, ChevronDown, X } from 'lucide-react';
import { navigationConfig, horizontalNavigationConfig } from '../config/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  currentPath: string;
  onNavigate: (path: string) => void;
};

export default function Navigation({ currentPath, onNavigate }: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleSectionClick = (sectionId: string, path: string) => {
    if (navigationConfig.find(s => s.id === sectionId)?.subSections) {
      setActiveSection(activeSection === sectionId ? null : sectionId);
    } else {
      onNavigate(path);
      setIsDropdownOpen(false);
    }
  };

  const handleSubSectionClick = (path: string) => {
    onNavigate(path);
    setIsDropdownOpen(false);
    setActiveSection(null);
  };

  return (
    <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600"
              >
                <Menu className="w-5 h-5" />
                <span className="font-semibold">Menu</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 top-full mt-2 w-80 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 max-h-[600px] overflow-y-auto"
                    >
                      <div className="p-2">
                        <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-slate-700">
                          <h3 className="font-bold text-white">Navigation</h3>
                          <button
                            onClick={() => setIsDropdownOpen(false)}
                            className="p-1 hover:bg-slate-700 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {navigationConfig.map((section) => (
                          <div key={section.id} className="mb-1">
                            <button
                              onClick={() => handleSectionClick(section.id, section.path)}
                              className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-slate-700 text-left transition-colors group"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-xl">{section.icon}</span>
                                <span className="font-semibold text-white group-hover:text-blue-400">
                                  {section.name}
                                </span>
                              </div>
                              {section.subSections && (
                                <ChevronDown
                                  className={`w-4 h-4 text-slate-400 transition-transform ${
                                    activeSection === section.id ? 'rotate-180' : ''
                                  }`}
                                />
                              )}
                            </button>

                            {section.subSections && activeSection === section.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ml-6 mt-1 space-y-1 overflow-hidden"
                              >
                                {section.subSections.map((subSection) => (
                                  <button
                                    key={subSection.id}
                                    onClick={() => handleSubSectionClick(subSection.path)}
                                    className="w-full flex items-center space-x-2 px-3 py-2 rounded hover:bg-slate-700 text-left transition-colors text-sm text-slate-300 hover:text-white"
                                  >
                                    {subSection.icon && <span>{subSection.icon}</span>}
                                    <span>{subSection.name}</span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <h1 className="text-lg font-bold text-white">AI Research Hub</h1>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {horizontalNavigationConfig.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPath === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
