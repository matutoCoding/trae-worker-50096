import { NavLink } from 'react-router-dom';
import {
  Image,
  Grid3x3,
  Eye,
  FileText,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { path: '/', label: '图像解析', icon: Image, end: true },
  { path: '/stripes-layout', label: '色篾排布', icon: Grid3x3 },
  { path: '/weaving-preview', label: '挑压成像', icon: Eye },
  { path: '/archives', label: '工艺档案', icon: FileText },
  { path: '/templates', label: '模板库', icon: LayoutGrid },
];

export default function Sidebar() {
  const { ui, toggleSidebar } = useAppStore();
  const { sidebarCollapsed } = ui;

  return (
    <aside
      className={`h-screen bg-parchment-50 border-r border-parchment-200 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 border-b border-parchment-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-bamboo-100 flex items-center justify-center flex-shrink-0">
          <Leaf className="w-6 h-6 text-bamboo-700" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="font-serif text-lg font-bold text-ink-800 whitespace-nowrap">
              竹篾编画
            </h1>
            <p className="text-xs text-ink-500 whitespace-nowrap">色篾排布成像系统</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''} ${
                sidebarCollapsed ? 'justify-center' : ''
              }`
            }
            title={sidebarCollapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        className="p-3 border-t border-parchment-200 hover:bg-parchment-100 transition-colors flex items-center justify-center text-ink-500 hover:text-ink-700"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <>
            <ChevronLeft className="w-5 h-5" />
            <span className="ml-2 text-sm">收起</span>
          </>
        )}
      </button>
    </aside>
  );
}
