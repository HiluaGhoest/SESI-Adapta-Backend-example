import { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import styles from './styles';

function StudentDocuments({ studentId }) {
  const [documents, setDocuments] = useState([]);
  const [downloadUrls, setDownloadUrls] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (!studentId) return;
    async function loadDocuments() {
      const { data, error } = await supabase
        .from('student_documents')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading documents:', error);
        return;
      }
      setDocuments(data);
      // Fetch public URLs for each document
      const urls = {};
      for (const doc of data) {
        const { data: urlData, error } = await supabase.storage
          .from('student-documents')
          .createSignedUrl(doc.original_file_url, 60, {
            // Use service role key for guaranteed access
            token: supabase.auth.getSession().session?.access_token
          }); 

        if (error) {
          console.error("Signed URL Error:", error);
          continue;
        }

        const signedUrl = urlData?.signedUrl;
        urls[doc.id] = signedUrl || null;
      }
      setDownloadUrls(urls);
    }
    loadDocuments();
  }, [studentId]);

  const handleFileUpload = async (e) => {
    if (!e.target.files.length) return;
    setUploadError("");
    setUploading(true);

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${studentId}/${fileName}`;

    const user = await supabase.auth.getUser();
    console.log('Current user id:', user.data.user?.id);

    const { error: uploadError } = await supabase.storage
      .from('student-documents')
      .upload(filePath, file);

    if (uploadError) {
      setUploadError(uploadError.message);
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('student_documents')
      .insert({
        student_id: studentId,
        doc_type: file.type,
        original_file_url: filePath,
      });

    if (insertError) {
      setUploadError(insertError.message);
      console.error('Insert error details:', insertError);
    }

    setUploading(false);
    // Refresh documents
    const { data, error } = await supabase
      .from('student_documents')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (!error) setDocuments(data);
  };

  return (
    <div style={styles.uploadContainer}>
      <label style={{ display: 'block', marginBottom: 8, fontWeight: '600' }}>Upload Document</label>
      <input
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
        style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
      />
      {uploadError && <div style={styles.error}>{uploadError}</div>}
      <ul style={styles.list}>
        {documents.map((doc) => (
          <li key={doc.id} style={styles.listItem}>
            <div>
              <strong>{doc.original_file_url.split('/').pop()}</strong><br />
              <span style={styles.subText}>{doc.doc_type}</span>
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {new Date(doc.created_at).toLocaleString()}
            </div>
            {downloadUrls[doc.id] && (
              <a
                href={downloadUrls[doc.id]}
                download
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: 12, color: '#007bff', textDecoration: 'underline', fontSize: 14 }}
              >
                Download
              </a>
            )}
          </li>
        ))}
        {documents.length === 0 && <li style={{ color: '#999', fontStyle: 'italic' }}>No documents uploaded.</li>}
      </ul>
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    onLogin(data.user);
  };

  return (
    <div style={styles.container}>
      <div style={{ marginBottom: 30, background: '#e6f0ff', padding: 16, borderRadius: 8, color: '#0a3d62' }}>
        <h3 style={{ marginTop: 0 }}>Available Logins</h3>
        <ul>
          <li><strong>specialist@test.com</strong> - specialist</li>
          <li><strong>admin@test.com</strong> - admin</li>
          <li><strong>teacher@test.com</strong> - teacher</li>
        </ul>
        <p style={{ fontSize: 14, color: '#444' }}>
          Use one of these emails to log in and test role-based access.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <h2 style={{ ...styles.header, marginBottom: 16 }}>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Login</button>
        {error && <div style={styles.error}>{error}</div>}
      </form>
    </div>
  );
}

function Page() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    async function getStudents() {
      const { data: students, error } = await supabase.from('students').select();
      if (error) {
        console.error('Error fetching students:', error);
        return;
      }
      if (students && students.length > 0) {
        setStudents(students);
      }
    }
    getStudents();
  }, []);

  return (
    <div style={{ ...styles.container, ...styles.section }}>
      <h3 style={styles.header}>Raw Students List</h3>
      <ul style={styles.list}>
        {students.map((student) => (
          <li key={student.id} style={styles.listItem}>
            {student.name} | {student.rm} | {student.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StudentManager() {
  const [name, setName] = useState("");
  const [rm, setRm] = useState("");
  const [email, setEmail] = useState("");
  const [students, setStudents] = useState([]);
  const [role, setRole] = useState("");

  const fetchStudents = async () => {
    const { data, error } = await supabase.from('students').select();
    if (error) {
      console.error('Error fetching students:', error);
      return;
    }
    setStudents(data || []);
  };

  useEffect(() => {
    fetchStudents();

    const fetchRole = async () => {
      const userResp = await supabase.auth.getUser();
      const user = userResp.data.user;
      if (user) {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        if (!error && data) {
          setRole(data.role);
        }
      }
    };
    fetchRole();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!name.trim() || !rm.trim() || !email.trim()) return;

    const { error } = await supabase.from('students').insert([{ name, rm, email }]);
    if (error) {
      console.error('Error adding student:', error);
      return;
    }
    setName("");
    setRm("");
    setEmail("");
    fetchStudents();
  };

  return (
    <div style={{ ...styles.container, ...styles.section }}>
      <h2 style={styles.header}>Student Manager</h2>
      {role === 'admin' ? (
        <form onSubmit={handleAddStudent} style={{ marginBottom: 30 }}>
          <input
            type="text"
            placeholder="Student name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Registration number (rm)"
            value={rm}
            onChange={(e) => setRm(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Add Student</button>
        </form>
      ) : (
        <div style={{ marginBottom: 20, color: '#888' }}>
          Only admins can add students. You can view the list below.
        </div>
      )}
      <div>
        {students.length === 0 && <p>No students found.</p>}
        {students.map((s) => (
          <div key={s.id} style={styles.studentCard}>
            <div style={styles.studentHeader}>{s.name}</div>
            <div style={styles.smallInfo}>
              RM: {s.rm} | Email: {s.email}
            </div>
            <StudentDocuments studentId={s.id} />
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div>
      {!user ? (
        <LoginForm onLogin={setUser} />
      ) : (
        <>
          <button onClick={handleLogout} style={styles.logoutBtn}>Log out</button>
          <Page />
          <StudentManager />
        </>
      )}
    </div>
  );
}

export default App;
