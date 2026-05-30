const API_URL = 'http://localhost:8787';
let cachedMetadata: any = null;
let mockFlashcards = new Map<string, any>();

const getStoredUser = () => {
  const token = localStorage.getItem('unimind_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token));
    const storedUser = localStorage.getItem('unimind_user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return {
      id: payload.userId,
      email: payload.email,
      name: 'Scholar',
      institution: 'UniMind Cloud',
      major: 'Deep Work',
      role: 'Researcher'
    };
  } catch (e) {
    return null;
  }
};

export const turso: any = {
  auth: {
    getUser: async () => {
      const user = getStoredUser();
      if (!user) return { data: { user: null }, error: null };
      return { 
        data: { 
          user: {
            id: user.id,
            email: user.email,
            user_metadata: {
              name: user.name || 'Scholar',
              institution: user.institution || 'UniMind Cloud',
              major: user.major || 'Deep Work',
              role: user.role || 'Researcher',
            }
          } 
        }, 
        error: null 
      };
    },
    signInWithPassword: async ({ email, password }: any) => {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const result = await response.json();
        if (!response.ok || result.error) {
          return { data: { user: null }, error: { message: result.error || 'Login failed' } };
        }
        if (result.token) {
          localStorage.setItem('unimind_token', result.token);
          localStorage.setItem('unimind_user', JSON.stringify(result.user));
        }
        return { 
          data: { 
            user: {
              id: result.user.id,
              email: result.user.email,
              user_metadata: {
                name: result.user.name,
                institution: result.user.institution,
                major: result.user.major,
                role: result.user.role
              }
            } 
          }, 
          error: null 
        };
      } catch (err: any) {
        return { data: { user: null }, error: { message: err.message || 'Network error' } };
      }
    },
    signUp: async ({ email, password, options }: any) => {
      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            name: options?.data?.name || 'Scholar',
            institution: options?.data?.institution || '',
            district: options?.data?.district || '',
            country: options?.data?.country || '',
            major: options?.data?.major || '',
            role: options?.data?.role || 'Undergraduate'
          })
        });
        const result = await response.json();
        if (!response.ok || result.error) {
          return { data: { user: null }, error: { message: result.error || 'Registration failed' } };
        }
        return { 
          data: { 
            user: {
              id: result.user.id,
              email: result.user.email,
              user_metadata: {
                name: result.user.name,
                institution: result.user.institution,
                major: result.user.major,
                role: result.user.role
              }
            } 
          }, 
          error: null 
        };
      } catch (err: any) {
        return { data: { user: null }, error: { message: err.message || 'Network error' } };
      }
    },
    signOut: async () => {
      localStorage.removeItem('unimind_token');
      localStorage.removeItem('unimind_user');
      return { error: null };
    },
    updateUser: async ({ data }: any) => {
      const user = getStoredUser();
      if (user) {
        if (data) {
          user.name = data.name || user.name;
          user.institution = data.institution || user.institution;
          user.major = data.major || user.major;
          user.role = data.role || user.role;
        }
        localStorage.setItem('unimind_user', JSON.stringify(user));
      }
      return { data: { user }, error: null };
    }
  },
  from: (table: string) => {
    const builder: any = {
      _action: '',
      _data: null,
      _single: false,
      select: (_columns?: string, _options?: any) => {
        builder._action = 'select';
        return builder;
      },
      insert: (data: any) => {
        builder._action = 'insert';
        builder._data = data;
        return builder;
      },
      update: (data: any) => {
        builder._action = 'update';
        builder._data = data;
        return builder;
      },
      upsert: (data: any, _options?: any) => {
        builder._action = 'upsert';
        builder._data = data;
        return builder;
      },
      delete: () => {
        builder._action = 'delete';
        return builder;
      },
      eq: (column: string, value: any) => {
        builder._eq = { column, value };
        return builder;
      },
      order: (_column: string, _options?: any) => {
        return builder;
      },
      limit: (_count: number) => {
        return builder;
      },
      single: () => {
        builder._single = true;
        return builder;
      },
      then: async (onfulfilled: any) => {
        try {
          let result: any = { data: null, error: null, count: 0 };
          const token = localStorage.getItem('unimind_token');
          const headers: any = {
            'Content-Type': 'application/json'
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          if (table === 'posts' && builder._action === 'select') {
            const res = await fetch(`${API_URL}/api/feed`);
            const json = await res.json();
            if (json.success) {
              result.data = json.data;
            } else {
              result.error = { message: json.error || 'Failed to fetch feed' };
            }
          } else if (table === 'folders') {
            if (builder._action === 'select') {
              const res = await fetch(`${API_URL}/api/folders`, { headers });
              const json = await res.json();
              result.data = json.data || [];
            } else if (builder._action === 'insert' || builder._action === 'upsert') {
              const payload = Array.isArray(builder._data) ? builder._data[0] : builder._data;
              const res = await fetch(`${API_URL}/api/folders`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
              });
              const json = await res.json();
              result.data = json.data;
            }
          } else if (table === 'notes') {
            if (builder._action === 'select') {
              const res = await fetch(`${API_URL}/api/notes`, { headers });
              const json = await res.json();
              result.data = json.data || [];
            } else if (builder._action === 'insert' || builder._action === 'upsert' || builder._action === 'update') {
              const payload = Array.isArray(builder._data) ? builder._data[0] : builder._data;
              const res = await fetch(`${API_URL}/api/notes`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
              });
              const json = await res.json();
              result.data = json.data;
            } else if (builder._action === 'delete') {
              const id = builder._eq?.value;
              const res = await fetch(`${API_URL}/api/notes?id=${id}`, {
                method: 'DELETE',
                headers
              });
              const json = await res.json();
              result.error = json.error ? { message: json.error } : null;
            }
          } else if (table === 'tasks') {
            if (builder._action === 'select') {
              const res = await fetch(`${API_URL}/api/tasks`, { headers });
              const json = await res.json();
              result.data = json.data || [];
            } else if (builder._action === 'insert' || builder._action === 'upsert' || builder._action === 'update') {
              const payload = Array.isArray(builder._data) ? builder._data[0] : builder._data;
              const res = await fetch(`${API_URL}/api/tasks`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
              });
              const json = await res.json();
              result.data = json.data;
            } else if (builder._action === 'delete') {
              const id = builder._eq?.value;
              const res = await fetch(`${API_URL}/api/tasks?id=${id}`, {
                method: 'DELETE',
                headers
              });
              const json = await res.json();
              result.error = json.error ? { message: json.error } : null;
            }
          } else if (table === 'metadata_requests') {
            if (builder._action === 'select') {
              const res = await fetch(`${API_URL}/api/metadata-requests`, { headers });
              const json = await res.json();
              result.data = json.data || [];
            } else if (builder._action === 'insert') {
              cachedMetadata = null; // Invalidate cache on insert
              const payload = Array.isArray(builder._data) ? builder._data[0] : builder._data;
              const res = await fetch(`${API_URL}/api/metadata-requests`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
              });
              const json = await res.json();
              result.data = json.data;
            } else if (builder._action === 'update') {
              cachedMetadata = null; // Invalidate cache on update
              const id = builder._eq?.value;
              const payload = builder._data;
              const res = await fetch(`${API_URL}/api/metadata-requests?id=${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
              });
              const json = await res.json();
              result.data = json.data;
            }
          } else if (table === 'metadata_approved') {
            if (builder._action === 'select') {
              if (cachedMetadata) {
                result.data = cachedMetadata;
              } else {
                const res = await fetch(`${API_URL}/api/metadata/approved`, { headers });
                const json = await res.json();
                cachedMetadata = {
                  institutions: json.institutions || [],
                  majors: json.majors || [],
                  sessions: json.sessions || [],
                  roles: json.roles || []
                };
                result.data = cachedMetadata;
              }
            }
          } else {
            if (table === 'users' && builder._single) {
              const u = getStoredUser();
              result.data = u;
            } else if (table === 'flashcards') {
              if (builder._action === 'select') {
                const all = Array.from(mockFlashcards.values());
                const noteId = builder._eq?.value;
                result.data = noteId ? all.filter(f => f.note_id === noteId) : all;
              } else if (builder._action === 'insert') {
                const inserts = Array.isArray(builder._data) ? builder._data : [builder._data];
                inserts.forEach((fc: any) => {
                  const id = crypto.randomUUID();
                  mockFlashcards.set(id, { id, ...fc, created_at: new Date().toISOString() });
                });
                result.data = inserts;
              } else if (builder._action === 'update') {
                const id = builder._eq?.value;
                if (id && mockFlashcards.has(id)) {
                   mockFlashcards.set(id, { ...mockFlashcards.get(id), ...builder._data });
                }
                result.data = [];
              }
            } else {
              result.data = [];
            }
          }

          if (builder._action === 'select' && Array.isArray(result.data)) {
            if (builder._eq) {
              result.data = result.data.filter((item: any) => item[builder._eq.column] === builder._eq.value);
            }
            if (builder._single) {
              result.data = result.data.length > 0 ? result.data[0] : null;
            }
          }

          return onfulfilled(result);
        } catch (err: any) {
          return onfulfilled({ data: null, error: { message: err.message } });
        }
      }
    };
    return builder;
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, _file: any) => {
        return { data: { path }, error: null };
      },
      getPublicUrl: (path: string) => {
        return { data: { publicUrl: `https://placeholder.url/${bucket}/${path}` } };
      }
    })
  }
};

