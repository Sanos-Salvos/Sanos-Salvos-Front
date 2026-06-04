import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginView() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOrg, setIsOrg] = useState(false);
  const [orgName, setOrgName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return alert('Por favor, completa los campos obligatorios.');
    if (isOrg && !orgName) return alert('Debes ingresar el nombre de la organización.');

    // Simula o procesa el login inyectándolo al contexto global
    login(email, password, isOrg, orgName);
  };

  return (
    <div className="login-page">
      <div className="login-side-panel left-panel">
        <div className="side-panel-title">📢 Alertas de la Comunidad</div>
        <div className="mini-alert-card">
          <span className="mini-alert-badge lost">Perdido</span>
          <h4>Fiona (Salchicha)</h4>
          <p>Última vez vista cerca de la plaza central.</p>
        </div>
      </div>

      <div className="login-card">
        <h2>{isRegister ? 'Crear Cuenta' : 'Ingresar al Portal'}</h2>
        <p>Sanos y Salvos - Reportes en tiempo real</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field-auth">
            <label>Correo Electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ejemplo@correo.com" required />
          </div>

          <div className="form-field-auth">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <div className="form-checkbox-auth">
            <input type="checkbox" id="checkOrg" checked={isOrg} onChange={e => setIsOrg(e.target.checked)} />
            <label htmlFor="checkOrg">Soy una Fundación / Organización</label>
          </div>

          {isOrg && (
            <div className="animated-org-fields">
              <div className="form-field-auth">
                <label>Nombre de la Organización</label>
                <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Ej: Refugio Patitas Felices" />
              </div>
            </div>
          )}

          <button type="submit" className="btn-auth-submit">
            {isRegister ? 'Registrarse de forma segura' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="auth-toggle-text">
          {isRegister ? '¿Ya tienes una cuenta operativa?' : '¿Es tu primera vez aquí? '}
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Ingresa aquí' : 'Regístrate aquí'}
          </span>
        </p>
      </div>

      <div className="login-side-panel">
        <div className="side-panel-title">🏢 Entidades Oficiales</div>
        <div className="mini-alert-card">
          <span className="mini-alert-badge org">Verificado</span>
          <h4>Refugio Patitas</h4>
          <p>Organización protectora activa en el sistema.</p>
        </div>
      </div>
    </div>
  );
}