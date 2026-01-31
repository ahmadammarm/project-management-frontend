import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import api from '../config/api';

export const fetchWorkspaces = createAsyncThunk(
    'workspace/fetchWorkspaces',
    async (token, {rejectWithValue}) => {
        try {
            const {data} = await api.get('/api/workspaces', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return data.workspaces || [];
        } catch (error) {
            console.error('Error fetching workspaces:', error);
            return rejectWithValue(
                error.response?.data || 'Failed to fetch workspaces',
            );
        }
    },
);

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    loading: false,
};

const workspaceSlice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        setWorkspaces: (state, action) => {
            state.workspaces = action.payload;
        },
        setCurrentWorkspace: (state, action) => {
            localStorage.setItem('currentWorkspaceId', action.payload);
            state.currentWorkspace = state.workspaces.find(
                w => w.id === action.payload,
            );
        },
        addWorkspace: (state, action) => {
            state.workspaces.push(action.payload);

            // set current workspace to the new workspace
            if (state.currentWorkspace?.id !== action.payload.id) {
                state.currentWorkspace = action.payload;
                localStorage.setItem('currentWorkspaceId', action.payload.id);
            }
        },
        updateWorkspace: (state, action) => {
            state.workspaces = state.workspaces.map(w =>
                w.id === action.payload.id ? action.payload : w,
            );

            // if current workspace is updated, set it to the updated workspace
            if (state.currentWorkspace?.id === action.payload.id) {
                state.currentWorkspace = action.payload;
            }
        },
        deleteWorkspace: (state, action) => {
            state.workspaces = state.workspaces.filter(
                w => w.id !== action.payload,
            );

            // If deleted workspace is current, switch to first available
            if (state.currentWorkspace?.id === action.payload) {
                state.currentWorkspace = state.workspaces[0] || null;
                if (state.currentWorkspace) {
                    localStorage.setItem(
                        'currentWorkspaceId',
                        state.currentWorkspace.id,
                    );
                } else {
                    localStorage.removeItem('currentWorkspaceId');
                }
            }
        },

        addProject: (state, action) => {
            if (!state.currentWorkspace) return;

            state.currentWorkspace.projects.push(action.payload);
            // find workspace by id and add project to it
            state.workspaces = state.workspaces.map(w =>
                w.id === state.currentWorkspace.id
                    ? {...w, projects: w.projects.concat(action.payload)}
                    : w,
            );
        },
        addTask: (state, action) => {
            if (!state.currentWorkspace) return;

            state.currentWorkspace.projects =
                state.currentWorkspace.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        p.tasks.push(action.payload);
                    }
                    return p;
                });

            // find workspace and project by id and add task to it
            state.workspaces = state.workspaces.map(w =>
                w.id === state.currentWorkspace.id
                    ? {
                          ...w,
                          projects: w.projects.map(p =>
                              p.id === action.payload.projectId
                                  ? {
                                        ...p,
                                        tasks: p.tasks.concat(action.payload),
                                    }
                                  : p,
                          ),
                      }
                    : w,
            );
        },
        updateTask: (state, action) => {
            if (!state.currentWorkspace) return;

            state.currentWorkspace.projects =
                state.currentWorkspace.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        p.tasks = p.tasks.map(t =>
                            t.id === action.payload.id ? action.payload : t,
                        );
                    }
                    return p;
                });

            // find workspace and project by id and update task in it
            state.workspaces = state.workspaces.map(w =>
                w.id === state.currentWorkspace.id
                    ? {
                          ...w,
                          projects: w.projects.map(p =>
                              p.id === action.payload.projectId
                                  ? {
                                        ...p,
                                        tasks: p.tasks.map(t =>
                                            t.id === action.payload.id
                                                ? action.payload
                                                : t,
                                        ),
                                    }
                                  : p,
                          ),
                      }
                    : w,
            );
        },
        deleteTask: (state, action) => {
            if (!state.currentWorkspace) return;

            state.currentWorkspace.projects =
                state.currentWorkspace.projects.map(p => {
                    p.tasks = p.tasks.filter(
                        t => !action.payload.includes(t.id),
                    );
                    return p;
                });

            // find workspace and project by id and delete task from it
            state.workspaces = state.workspaces.map(w =>
                w.id === state.currentWorkspace.id
                    ? {
                          ...w,
                          projects: w.projects.map(p =>
                              p.id === action.payload.projectId
                                  ? {
                                        ...p,
                                        tasks: p.tasks.filter(
                                            t => !action.payload.includes(t.id),
                                        ),
                                    }
                                  : p,
                          ),
                      }
                    : w,
            );
        },

        resetWorkspaceState: state => {
            state.workspaces = [];
            state.currentWorkspace = null;
            state.loading = false;
            localStorage.removeItem('currentWorkspaceId');
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchWorkspaces.pending, state => {
            state.loading = true;
        });

        builder.addCase(fetchWorkspaces.fulfilled, (state, action) => {
            state.workspaces = action.payload;

            if (action.payload.length > 0) {
                const storedId = localStorage.getItem('currentWorkspaceId');
                const foundWorkspace = action.payload.find(
                    w => w.id === storedId,
                );

                // Set current workspace
                state.currentWorkspace = foundWorkspace || action.payload[0];

                if (state.currentWorkspace) {
                    localStorage.setItem(
                        'currentWorkspaceId',
                        state.currentWorkspace.id,
                    );
                }
            } else {
                state.currentWorkspace = null;
                localStorage.removeItem('currentWorkspaceId');
            }

            state.loading = false;
        });

        builder.addCase(fetchWorkspaces.rejected, state => {
            state.loading = false;
        });
    },
});

export const {
    setWorkspaces,
    setCurrentWorkspace,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addProject,
    addTask,
    updateTask,
    deleteTask,
    resetWorkspaceState, // EXPORT action baru
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
