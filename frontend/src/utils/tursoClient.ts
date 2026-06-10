/* eslint-disable @typescript-eslint/no-unused-vars */
const API_URL = '';
let cachedMetadata: { data: any, timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
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
              session: user.session || '',
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
                session: result.user.session || '',
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
            session: options?.data?.session || '',
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
                session: result.user.session || '',
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
          user.session = data.session !== undefined ? data.session : user.session;
          user.role = data.role || user.role;
        }
        localStorage.setItem('unimind_user', JSON.stringify(user));
      }
      return { data: { user }, error: null };
    }
  },
  removeChannel: (_channel: any) => {},
  channel: (_name: string) => {
    const mockChannel = {
      on: () => mockChannel,
      subscribe: () => mockChannel,
      unsubscribe: () => {}
    };
    return mockChannel;
  },
  from: (table: string) => {
    const builder: any = {
      _action: '',
      _data: null,
      _single: false,
      select: (_columns?: string, _options?: any) => {
        if (!builder._action) {
          builder._action = 'select';
        }
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
        if (!builder._eqs) builder._eqs = [];
        builder._eqs.push({ column, value });
        builder._eq = { column, value }; // backward compat
        return builder;
      },
      ilike: (column: string, value: string) => {
        if (!builder._ilikes) builder._ilikes = [];
        builder._ilikes.push({ column, value });
        return builder;
      },
      order: (column: string, options?: any) => {
        builder._order = { column, ascending: options?.ascending !== false };
        return builder;
      },
      limit: (count: number) => {
        builder._limit = count;
        return builder;
      },
      single: () => {
        builder._single = true;
        return builder;
      },
      maybeSingle: () => {
        builder._single = true;
        return builder;
      },
      then: async (onfulfilled: any) => {
        try {
          const result: any = { data: null, error: null, count: 0 };
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
              result.data = json.data.map((p: any) => ({
                ...p,
                users: {
                  name: p.author_name,
                  role: p.author_role,
                  avatar_url: p.author_avatar_url
                }
              }));
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
            } else if (builder._action === 'insert') {
              const payload = Array.isArray(builder._data) ? builder._data[0] : builder._data;
              const res = await fetch(`${API_URL}/api/notes`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
              });
              const json = await res.json();
              result.data = json.data;
            } else if (builder._action === 'upsert' || builder._action === 'update') {
              const payload = Array.isArray(builder._data) ? builder._data[0] : builder._data;
              if (builder._eq && builder._eq.column === 'id' && !payload.id) {
                 payload.id = builder._eq.value;
              }
              const res = await fetch(`${API_URL}/api/dynamic/notes`, {
                method: 'PUT',
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
            } else if (builder._action === 'insert') {
              const payload = Array.isArray(builder._data) ? builder._data[0] : builder._data;
              const res = await fetch(`${API_URL}/api/tasks`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
              });
              const json = await res.json();
              result.data = json.data;
            } else if (builder._action === 'upsert' || builder._action === 'update') {
              const payload = Array.isArray(builder._data) ? builder._data[0] : builder._data;
              if (builder._eq && builder._eq.column === 'id' && !payload.id) {
                 payload.id = builder._eq.value;
              }
              const res = await fetch(`${API_URL}/api/dynamic/tasks`, {
                method: 'PUT',
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
              if (cachedMetadata && (Date.now() - cachedMetadata.timestamp < CACHE_TTL)) {
                result.data = cachedMetadata.data;
              } else {
                const res = await fetch(`${API_URL}/api/metadata/approved`, { headers });
                const json = await res.json();
                cachedMetadata = {
                  data: {
                    institutions: json.institutions || [],
                    majors: json.majors || [],
                    sessions: json.sessions || [],
                    roles: json.roles || []
                  },
                  timestamp: Date.now()
                };
                result.data = cachedMetadata.data;
              }
            }
          } else {
            if (table === 'flashcards') {
            if (builder._action === 'select') {
              const noteId = builder._eq?.value;
              const url = noteId ? `${API_URL}/api/flashcards?note_id=${noteId}` : `${API_URL}/api/flashcards`;
              const res = await fetch(url, { headers });
              const json = await res.json();
              result.data = json.data || [];
            } else if (builder._action === 'insert') {
              const payload = Array.isArray(builder._data) ? builder._data : [builder._data];
              const res = await fetch(`${API_URL}/api/flashcards`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
              });
              const json = await res.json();
              result.data = json.data;
            } else if (builder._action === 'update') {
              const id = builder._eq?.value;
              const payload = { id, ...builder._data };
              const res = await fetch(`${API_URL}/api/flashcards`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
              });
              const json = await res.json();
              result.data = [json.data]; // Expect array return pattern for .then data mapping
            } else if (builder._action === 'delete') {
              const id = builder._eq?.value;
              const res = await fetch(`${API_URL}/api/flashcards?id=${id}`, {
                method: 'DELETE',
                headers
              });
              const json = await res.json();
              result.error = json.error ? { message: json.error } : null;
            }
            } else {
              // Dynamic fallback for communities, research, feed posts, etc.
              const method = builder._action === 'select' ? 'GET' : 
                             builder._action === 'delete' ? 'DELETE' : 
                             builder._action === 'update' ? 'PUT' : 'POST';
                             
              let url = `${API_URL}/api/dynamic/${table}`;
              const urlObj = new URL(url, window.location.origin);
              
              if (method === 'GET' || method === 'DELETE') {
                 if (builder._eqs) {
                     builder._eqs.forEach((eq: any) => urlObj.searchParams.append(`eq_${eq.column}`, eq.value));
                 } else if (builder._eq) {
                     urlObj.searchParams.append('eqColumn', builder._eq.column);
                     urlObj.searchParams.append('eqValue', builder._eq.value);
                 }
                 if (builder._ilikes) {
                     builder._ilikes.forEach((il: any) => urlObj.searchParams.append(`ilike_${il.column}`, il.value.replace(/%/g, '')));
                 }
                 if (builder._order) {
                     urlObj.searchParams.append('order', builder._order.column);
                     urlObj.searchParams.append('dir', builder._order.ascending ? 'asc' : 'desc');
                 }
                 if (builder._limit) {
                     urlObj.searchParams.append('limit', builder._limit.toString());
                 }
              }
              url = urlObj.pathname + urlObj.search;
              // If API_URL is provided, we might need to prepend it back properly if it's external,
              // but since API_URL is empty (''), pathname + search works fine.
              if (API_URL) {
                  url = API_URL + url;
              }
              
              const options: any = { method, headers };
              if (method !== 'GET' && method !== 'DELETE') {
                 const payload = Array.isArray(builder._data) ? builder._data[0] : builder._data;
                 if (method === 'PUT' && builder._eq && builder._eq.column === 'id' && !payload.id) {
                     payload.id = builder._eq.value;
                 }
                 options.body = JSON.stringify(payload);
              }
              
              const res = await fetch(url, options);
              const json = await res.json();
              if (json.success) {
                result.data = json.data;
              } else {
                result.error = { message: json.error };
              }
            }
          }

          if (builder._action === 'select' && Array.isArray(result.data)) {
            // Keep local filtering as a fallback for non-dynamic tables
            if (builder._eqs) {
              builder._eqs.forEach((eq: any) => {
                 result.data = result.data.filter((item: any) => item[eq.column] === eq.value);
              });
            } else if (builder._eq) {
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
  // Storage has been removed — all image uploads now use IMGBB (see utils/imgbbUpload.ts)
  // Documents/PDFs are stored as base64 directly in Turso.
};

