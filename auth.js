// ============================================
// Authentication Module - VERSÃO CORRIGIDA
// ============================================

const Auth = {
  // Keys for localStorage
  KEYS: {
    TOKEN: "oasis_token",
    USER: "oasis_user",
  },

  // ========================================
  // Token Management
  // ========================================

  saveToken(token) {
    localStorage.setItem(this.KEYS.TOKEN, token);
  },

  getToken() {
    return localStorage.getItem(this.KEYS.TOKEN);
  },

  removeToken() {
    localStorage.removeItem(this.KEYS.TOKEN);
  },

  hasToken() {
    return !!this.getToken();
  },

  // ========================================
  // User Data Management
  // ========================================

  saveUser(user) {
    localStorage.setItem(this.KEYS.USER, JSON.stringify(user));
  },

  getUser() {
    const userData = localStorage.getItem(this.KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  },

  removeUser() {
    localStorage.removeItem(this.KEYS.USER);
  },

  // ========================================
  // Authentication Actions
  // ========================================

async login(email, senha) {
  try {
    const response = await API.login(email, senha);

    // Este é o formato REAL retornado:
    // { success: true, data: { token: ..., usuario: ... } }

    if (
      response &&
      response.success === true &&
      response.data &&
      typeof response.data.token === "string" &&
      response.data.usuario
    ) {
      this.saveToken(response.data.token);
      this.saveUser(response.data.usuario);
      return { success: true, user: response.data.usuario };
    } else {
      // Retorna erro caso não passe
      return {
        success: false,
        error:
          response.erro ||
          response.error ||
          (response.data && response.data.erro) ||
          response.message ||
          "Erro ao fazer login"
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "Erro ao conectar com o servidor"
    };
  }
}
,
  async signup(userData) {
    try {
      const response = await API.signup(userData);

      // DEBUG
      console.log("Response completa do signup:", response);

      // CASO 1: { success: true, data: {...} }
      if (response.success) {
        return { success: true };
      }

      // CASO 2: { mensagem: "...", usuario: {...} }
      if (response.mensagem || response.usuario) {
        return { success: true };
      }

      // CASO 3: Erro
      return {
        success: false,
        error: response.erro || response.error || "Erro ao criar conta",
      };
    } catch (error) {
      console.error("Erro no signup:", error);
      return {
        success: false,
        error: error.message || "Erro ao conectar com o servidor",
      };
    }
  },

  logout() {
    this.removeToken();
    this.removeUser();
    window.location.href = "login.html";
  },

  // ========================================
  // Route Protection
  // ========================================

  requireAuth() {
    if (!this.hasToken()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  },

  redirectIfAuthenticated() {
    if (this.hasToken()) {
      window.location.href = "index.html";
      return true;
    }
    return false;
  },
};

// ============================================
// Login Page Logic
// ============================================

if (window.location.pathname.endsWith("login.html")) {
  // Redireciona se já estiver autenticado
  Auth.redirectIfAuthenticated();

  const loginForm = document.getElementById("loginForm");
  const loginBtn = document.getElementById("loginBtn");

  function showToast(message, type = "success") {
    // Cria ou pega o elemento de toast
    let toast = document.getElementById('authToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'authToast';
      toast.className = 'profile-alert-toast';
      document.body.appendChild(toast);
    }

    // Remove classe show para esconder antes de atualizar
    toast.classList.remove('show');
    
    // Aguarda animação de saída antes de atualizar o conteúdo
    setTimeout(() => {
      // Define classe baseada no tipo
      const typeClass = type === 'success' ? 'profile-alert-toast-success' : 'profile-alert-toast-error';
      const icon = type === 'success' ? 'bx-check-circle' : 'bx-error-circle';
      
      toast.className = `profile-alert-toast ${typeClass}`;
      toast.innerHTML = `<i class='bx ${icon}'></i><span>${message}</span>`;
      
      // Mostra o toast após atualizar
      setTimeout(() => toast.classList.add('show'), 10);
      
      // Remove após 4 segundos
      setTimeout(() => toast.classList.remove('show'), 4000);
    }, 100);
  }

  function setLoading(loading) {
    loginBtn.disabled = loading;
    if (loading) {
      loginBtn.innerHTML =
        '<div class="spinner-small"></div><span>Entrando...</span>';
    } else {
      loginBtn.innerHTML = '<i class="bx bx-log-in"></i><span>Entrar</span>';
    }
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showToast("Por favor, preencha todos os campos", "error");
      return;
    }

    setLoading(true);

    const result = await Auth.login(email, password);

    if (result.success) {
      showToast("Login realizado com sucesso! Redirecionando...", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else {
      setLoading(false);
      showToast(result.error || "Erro ao fazer login", "error");
    }
  });
}

// ============================================
// Signup Page Logic
// ============================================

if (window.location.pathname.endsWith("signup.html")) {
  // Redireciona se já estiver autenticado
  Auth.redirectIfAuthenticated();

  const signupForm = document.getElementById("signupForm");
  const signupBtn = document.getElementById("signupBtn");

  function showToast(message, type = "success") {
    // Define ID baseado no tipo
    const toastId = type === 'success' ? 'authToastSuccess' : 'authToastError';
    const otherToastId = type === 'success' ? 'authToastError' : 'authToastSuccess';
    
    // Esconde o toast do outro tipo se estiver visível
    const otherToast = document.getElementById(otherToastId);
    if (otherToast) {
      otherToast.classList.remove('show');
    }
    
    // Cria ou pega o elemento de toast específico
    let toast = document.getElementById(toastId);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = toastId;
      const typeClass = type === 'success' ? 'profile-alert-toast-success' : 'profile-alert-toast-error';
      toast.className = `profile-alert-toast ${typeClass}`;
      document.body.appendChild(toast);
    }

    // Define ícone baseado no tipo
    const icon = type === 'success' ? 'bx-check-circle' : 'bx-error-circle';
    toast.innerHTML = `<i class='bx ${icon}'></i><span>${message}</span>`;
    
    // Mostra o toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove após 4 segundos
    setTimeout(() => toast.classList.remove('show'), 4000);
  }

  function setLoading(loading) {
    signupBtn.disabled = loading;
    if (loading) {
      signupBtn.innerHTML =
        '<div class="spinner-small"></div><span>Criando conta...</span>';
    } else {
      signupBtn.innerHTML =
        '<i class="bx bx-user-plus"></i><span>Criar Conta</span>';
    }
  }

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const birthDate = document.getElementById("birthDate").value;
    const gender = document.getElementById("gender").value;

    if (!name || !email || !password) {
      showToast("Por favor, preencha todos os campos obrigatórios", "error");
      return;
    }

    if (password.length < 6) {
      showToast("A senha deve ter no mínimo 6 caracteres", "error");
      return;
    }

    setLoading(true);

    // Calcula idade automaticamente se data de nascimento fornecida
    let calculatedAge = null;
    if (birthDate) {
      const today = new Date();
      const birth = new Date(birthDate);
      calculatedAge = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
    }

    const userData = {
      nome: name,
      email: email,
      senha: password,
      data_nasc: birthDate || null,
      idade: calculatedAge,
      sexo: gender || null,
    };

    const result = await Auth.signup(userData);

    if (result.success) {
      showToast(
        "Conta criada com sucesso! Redirecionando para login...",
        "success"
      );
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      setLoading(false);
      showToast(result.error || "Erro ao criar conta", "error");
    }
  });
}

// Export for use in other files
if (typeof window !== "undefined") {
  window.Auth = Auth;
}
