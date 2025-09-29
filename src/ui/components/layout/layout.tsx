import { Breadcrumbs } from "../breadcrumbs/breadcrumbs";
import { Footer } from "../navigation/footer";
import { Navigation } from "../navigation/Navigation";
import { Container } from "../container/container";
import { UserAccountNavigation } from "../navigation/user-account-navigation";
import { Session } from "../session/session";
import { SessionStatusTypes } from "@/types/session-status-types"; 
import { useMemo } from "react";
import { CallsToActionSideBarGroup } from "../call-to-action/call-to-action-sidebar-contribution";
import { CallsToActionSideBarGroup1 } from "../call-to-action/call-to-action-sidebar-contribution1";
import { UserAccountNavigationContainer } from "../navigation/user-account-navigation.container";
import { useRouter } from "next/router";

interface Props {
    children: React.ReactNode;
    isDisplayBreadcrumbs?: boolean;
    withSidebar?: boolean;
    sessionStatus?: SessionStatusTypes;
    sidebarComponentProps?: any;
}

export const Layout = ({ children, isDisplayBreadcrumbs, withSidebar, sessionStatus, sidebarComponentProps }: Props) => {
    const router = useRouter();
    const isMonEspace = router.pathname === "/mon-espace";
    
    const view = useMemo(() => {
        if (withSidebar) {
            return (
                <div className="flex min-h-screen bg-gray-50">
                    {/* Sidebar */}
                    <div className={`${
                        isMonEspace 
                            ? "fixed top-0 left-0 w-64 h-screen bg-white shadow-lg z-40" 
                            : "w-64 h-screen bg-white shadow-sm"
                    }`}>
                        <div className={isMonEspace ? "pt-20 h-full" : "h-full"}>
                            <UserAccountNavigationContainer {...sidebarComponentProps} />
                        </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className={`flex-1 ${isMonEspace ? "ml-64" : ""}`}>
                        <div className="p-6">
                            {children}
                        </div>
                    </div>
                </div>
            );
        }
        return <>{children}</>;
    }, [withSidebar, children, isMonEspace, sidebarComponentProps]);

    return (
        <Session sessionStatus={sessionStatus}>
            {isMonEspace && (
                <div className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
                    <Navigation />
                </div>
            )}
            {!isMonEspace && <Navigation />}
            
            <div className={isMonEspace ? "pt-20" : ""}>
                {view}
                {!isMonEspace && <Footer />}
            </div>
        </Session>
    );
};