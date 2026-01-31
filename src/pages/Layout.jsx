import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { Loader2Icon, RefreshCw } from 'lucide-react'
import { useUser, SignIn, useAuth, CreateOrganization } from '@clerk/clerk-react'
import { fetchWorkspaces } from '../features/workspaceSlice'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const { loading, workspaces } = useSelector(
        (state) => state.workspace
    );

    const dispatch = useDispatch()

    const { user, isLoaded } = useUser()
    const { getToken } = useAuth()

    useEffect(() => {
        dispatch(loadTheme())
    }, [dispatch])

    // Fetch workspaces saat user login
    useEffect(() => {
        if (!isLoaded || !user) return;

        const loadWorkspaces = async () => {
            try {
                const token = await getToken();
                await dispatch(fetchWorkspaces(token));
            } catch (error) {
                console.error('Error loading workspaces:', error);
            }
        };

        loadWorkspaces();
    }, [isLoaded, user?.id, dispatch, getToken]);

    // Auto-refresh saat window focus (user kembali ke tab)
    useEffect(() => {
        if (!user || !isLoaded) return;

        const handleFocus = async () => {
            console.log('Window focused, refreshing workspaces...');
            try {
                const token = await getToken();
                await dispatch(fetchWorkspaces(token));
            } catch (error) {
                console.error('Error refreshing workspaces:', error);
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user, isLoaded, dispatch, getToken]);

    // Manual refresh handler
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const token = await getToken();
            await dispatch(fetchWorkspaces(token));
        } catch (error) {
            console.error('Error refreshing workspaces:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
                <Loader2Icon className="size-7 animate-spin text-blue-500" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
                <div className="w-full max-w-md p-6">
                    <SignIn
                        afterSignInUrl="/"
                    />
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
                <div className="text-center space-y-4">
                    <Loader2Icon className="size-7 text-blue-500 animate-spin mx-auto" />
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Loading your workspaces...
                    </p>
                </div>
            </div>
        )
    }

    if (workspaces.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-950 p-4">
                <div className="text-center space-y-6 max-w-md">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                            Welcome to Your Workspace
                        </h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Create your first organization or join an existing one to get started
                        </p>
                    </div>

                    <CreateOrganization
                        afterCreateOrganizationUrl="/"
                    />

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                            Already accepted an invitation?
                        </p>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh Workspaces'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 p-6 xl:p-10 xl:px-16 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout