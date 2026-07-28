import { useNavigate, useHref, useLocation } from '@solidjs/router'
import type { RouteSectionProps } from '@solidjs/router'
import { css } from '@styled-system/css'
import { theme, toggleTheme } from '@/stores/theme'

function NavLink(props: { href: string; children: string; end?: boolean }) {
  const navigate = useNavigate()
  const href = useHref(() => props.href)
  const location = useLocation()
  const isActive = () => (props.end ? location.pathname === props.href : location.pathname.startsWith(props.href))

  return (
    <a
      href={href()}
      onClick={(e) => {
        e.preventDefault()
        navigate(props.href)
      }}
      class={css({
        color: isActive() ? 'accent' : 'text',
        textDecoration: 'none',
        fontWeight: isActive() ? '600' : '400',
        _hover: { color: 'accent' },
      })}
    >
      {props.children}
    </a>
  )
}

interface MainLayoutProps {
  children: RouteSectionProps
}

export function MainLayout(props: MainLayoutProps) {
  return (
    <>
      <nav
        class={css({
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          alignItems: 'center',
          py: '16px',
          borderBottom: '1px solid token(colors.border)',
        })}
      >
        <NavLink href="/" end>Home</NavLink>
        <NavLink href="/about">About</NavLink>
        <NavLink href="/pos/dashboard" end>หน้าหลัก</NavLink>
        <NavLink href="/pos" end>POS</NavLink>
        <NavLink href="/pos/products">สินค้า</NavLink>
        <NavLink href="/pos/categories">ประเภท</NavLink>
        <NavLink href="/pos/sales">ประวัติขาย</NavLink>
        <NavLink href="/pos/customers">ลูกค้า</NavLink>
        <NavLink href="/pos/debts">ลูกหนี้</NavLink>
        <NavLink href="/pos/stock-adjust">สต็อก</NavLink>
        <NavLink href="/pos/reports">รายงาน</NavLink>

        <button
          onClick={toggleTheme}
          title={theme() === 'dark' ? 'โหมดสว่าง' : 'โหมดมืด'}
          class={css({
            ml: 'auto', px: '12px', py: '6px', borderRadius: '6px', cursor: 'pointer',
            border: '1px solid token(colors.border)', bg: 'bg', color: 'text',
            fontSize: '14px',
            _hover: { bg: 'code-bg' },
          })}
        >
          {theme() === 'dark' ? '☀️' : '🌙'}
        </button>
      </nav>
      {props.children.children}
    </>
  )
}