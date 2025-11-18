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
  const alertBox = document.getElementById("alertBox");

  function showAlert(message, type = "error") {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} show`;
    setTimeout(() => {
      alertBox.className = "alert";
    }, 5000);
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
      showAlert("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);

    const result = await Auth.login(email, password);

    if (result.success) {
      showAlert("Login realizado com sucesso! Redirecionando...", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else {
      setLoading(false);
      showAlert(result.error || "Erro ao fazer login");
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
  const alertBox = document.getElementById("alertBox");

  function showAlert(message, type = "error") {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} show`;
    setTimeout(() => {
      alertBox.className = "alert";
    }, 5000);
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
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;

    if (!name || !email || !password) {
      showAlert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (password.length < 6) {
      showAlert("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    const userData = {
      nome: name,
      email: email,
      senha: password,
      data_nasc: birthDate || null,
      idade: age ? parseInt(age) : null,
      sexo: gender || null,
    };

    const result = await Auth.signup(userData);

    if (result.success) {
      showAlert(
        "Conta criada com sucesso! Redirecionando para login...",
        "success"
      );
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      setLoading(false);
      showAlert(result.error || "Erro ao criar conta");
    }
  });
}

// Export for use in other files
if (typeof window !== "undefined") {
  window.Auth = Auth;
}
