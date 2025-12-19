import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Extended NavLink props with additional styling options
 */
interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  /** Base className applied to the link */
  className?: string;
  /** Additional className applied when link is active */
  activeClassName?: string;
  /** Additional className applied when navigation is pending */
  pendingClassName?: string;
  /** Optional icon to display before children */
  icon?: React.ReactNode;
  /** Whether to show active indicator */
  showActiveIndicator?: boolean;
  /** Custom active indicator element */
  activeIndicator?: React.ReactNode;
}

/**
 * Enhanced NavLink component with additional styling capabilities
 * 
 * @example
 * ```tsx
 * <NavLink 
 *   to="/dashboard" 
 *   activeClassName="text-primary font-semibold"
 *   icon={<HomeIcon />}
 *   showActiveIndicator
 * >
 *   Dashboard
 * </NavLink>
 * ```
 */
const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  (
    {
      className,
      activeClassName,
      pendingClassName,
      icon,
      showActiveIndicator = false,
      activeIndicator,
      children,
      to,
      ...props
    },
    ref
  ) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending, isTransitioning }) =>
          cn(
            // Base styles
            "relative inline-flex items-center gap-2 transition-all duration-200",
            className,
            // Active state
            isActive && cn("font-medium", activeClassName),
            // Pending state
            isPending && cn("opacity-70 cursor-wait", pendingClassName),
            // Transitioning state
            isTransitioning && "opacity-80"
          )
        }
        {...props}
      >
        {({ isActive, isPending }) => (
          <>
            {/* Optional Icon */}
            {icon && (
              <span
                className={cn(
                  "shrink-0 transition-transform duration-200",
                  isActive && "scale-110",
                  isPending && "animate-pulse"
                )}
                aria-hidden="true"
              >
                {icon}
              </span>
            )}

            {/* Link Content */}
            <span className="relative">
              {children}

              {/* Active Indicator */}
              {showActiveIndicator && isActive && (
                <span
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-current rounded-full animate-scale-in"
                  aria-hidden="true"
                >
                  {activeIndicator}
                </span>
              )}
            </span>

            {/* Pending Loading Indicator */}
            {isPending && (
              <span
                className="absolute inset-0 bg-current opacity-5 rounded animate-pulse"
                aria-hidden="true"
              />
            )}
          </>
        )}
      </RouterNavLink>
    );
  }
);

NavLink.displayName = "NavLink";

/**
 * Preset NavLink variants for common use cases
 */
export const NavLinkVariants = {
  /** Sidebar navigation style */
  sidebar: {
    className: "w-full px-4 py-2.5 rounded-lg hover:bg-accent/50",
    activeClassName: "bg-accent text-accent-foreground shadow-sm",
  },
  
  /** Top navigation bar style */
  topbar: {
    className: "px-3 py-2 rounded-md hover:bg-accent/30 text-sm",
    activeClassName: "bg-accent/50 text-foreground",
    showActiveIndicator: true,
  },
  
  /** Tab style navigation */
  tab: {
    className: "px-4 py-2 border-b-2 border-transparent hover:border-muted-foreground/30",
    activeClassName: "border-primary text-primary font-semibold",
  },
  
  /** Breadcrumb style */
  breadcrumb: {
    className: "text-sm text-muted-foreground hover:text-foreground",
    activeClassName: "text-foreground font-medium pointer-events-none",
  },

  /** Mobile menu style */
  mobile: {
    className: "w-full px-4 py-3 text-lg border-b border-border/50 hover:bg-accent/30",
    activeClassName: "bg-accent/50 text-foreground font-semibold border-l-4 border-l-primary",
  },
};

/**
 * Pre-configured NavLink components for common patterns
 */
export const SidebarNavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  (props, ref) => <NavLink ref={ref} {...NavLinkVariants.sidebar} {...props} />
);
SidebarNavLink.displayName = "SidebarNavLink";

export const TopbarNavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  (props, ref) => <NavLink ref={ref} {...NavLinkVariants.topbar} {...props} />
);
TopbarNavLink.displayName = "TopbarNavLink";

export const TabNavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  (props, ref) => <NavLink ref={ref} {...NavLinkVariants.tab} {...props} />
);
TabNavLink.displayName = "TabNavLink";

export const BreadcrumbNavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  (props, ref) => <NavLink ref={ref} {...NavLinkVariants.breadcrumb} {...props} />
);
BreadcrumbNavLink.displayName = "BreadcrumbNavLink";

export const MobileNavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  (props, ref) => <NavLink ref={ref} {...NavLinkVariants.mobile} {...props} />
);
MobileNavLink.displayName = "MobileNavLink";

export { NavLink };
