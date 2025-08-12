// styles.js
const styles = {
  container: {
    maxWidth: 900,
    margin: '20px auto',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  header: {
    marginBottom: 20,
    fontWeight: 700,
    color: '#222',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    marginBottom: 12,
    borderRadius: 6,
    border: '1.5px solid #ddd',
    fontSize: 16,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: '#4a90e2',
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#4a90e2',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonDisabled: {
    backgroundColor: '#a5c1f7',
    cursor: 'not-allowed',
  },
  error: {
    color: '#e74c3c',
    marginTop: 8,
    fontWeight: 600,
  },
  list: {
    listStyleType: 'none',
    paddingLeft: 0,
  },
  listItem: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 14,
    color: '#555',
  },
  subText: {
    fontSize: 12,
    color: '#999',
  },
  uploadContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  section: {
    marginBottom: 40,
  },
  logoutBtn: {
    float: 'right',
    margin: '10px',
    padding: '8px 18px',
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  studentCard: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  studentHeader: {
    fontWeight: 700,
    fontSize: 18,
    marginBottom: 8,
    color: '#222',
  },
  smallInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
};

export default styles;
