// ============================================
// OASIS - Habit Tracker App (API Integrated)
// ============================================

// ============================================
// Cloudinary Configuration
// ============================================
const CLOUDINARY_CONFIG = {
  cloudName: 'dqaayvyhw',
  uploadPreset: 'oasis_profiles',
  folder: 'oasis_profiles'
};

// ============================================
// App State & Configuration
// ============================================
const AppState = {
  currentPage: "habits",
  habits: [],
  journalEntries: [],
  categories: [],
  editingHabitId: null,
  deletingHabitId: null,
  editingJournalId: null,
  deletingJournalId: null,
  user: null, // Será carregado do localStorage
};

// ============================================
// DOM Elements Cache
// ============================================
const DOM = {
  // Layout
  loadingOverlay: document.getElementById("loadingOverlay"),
  mainContainer: document.getElementById("mainContainer"),
  sidebar: document.getElementById("sidebar"),
  menuToggle: document.getElementById("menuToggle"),
  closeSidebar: document.getElementById("closeSidebar"),

  // Navigation
  navItems: document.querySelectorAll(".nav-item"),
  logoutBtn: document.getElementById("logoutBtn"),

  // Header
  pageTitle: document.getElementById("pageTitle"),
  pageSubtitle: document.getElementById("pageSubtitle"),
  userName: document.getElementById("userName"),
  avatar: document.querySelector(".avatar"),

  // Pages
  habitsPage: document.getElementById("habitsPage"),
  journalPage: document.getElementById("journalPage"),
  statsPage: document.getElementById("statsPage"),
  profilePage: document.getElementById("profilePage"),

  // Habits
  habitsGrid: document.getElementById("habitsGrid"),
  searchHabits: document.getElementById("searchHabits"),
  addHabitBtn: document.getElementById("addHabitBtn"),

  // Modals
  habitModal: document.getElementById("habitModal"),
  deleteModal: document.getElementById("deleteModal"),
  logoutModal: document.getElementById("logoutModal"),
  deleteJournalModal: document.getElementById("deleteJournalModal"),
  editJournalModal: document.getElementById("editJournalModal"),
  modalTitle: document.getElementById("modalTitle"),
  closeModal: document.getElementById("closeModal"),
  cancelModal: document.getElementById("cancelModal"),
  closeDeleteModal: document.getElementById("closeDeleteModal"),
  cancelDelete: document.getElementById("cancelDelete"),
  confirmDelete: document.getElementById("confirmDelete"),
  closeLogoutModal: document.getElementById("closeLogoutModal"),
  cancelLogout: document.getElementById("cancelLogout"),
  confirmLogout: document.getElementById("confirmLogout"),
  closeDeleteJournalModal: document.getElementById("closeDeleteJournalModal"),
  cancelDeleteJournal: document.getElementById("cancelDeleteJournal"),
  confirmDeleteJournal: document.getElementById("confirmDeleteJournal"),
  closeEditJournalModal: document.getElementById("closeEditJournalModal"),
  cancelEditJournal: document.getElementById("cancelEditJournal"),
  editJournalForm: document.getElementById("editJournalForm"),
  editJournalContent: document.getElementById("editJournalContent"),

  // Forms
  habitForm: document.getElementById("habitForm"),
  habitTitle: document.getElementById("habitTitle"),
  habitDescription: document.getElementById("habitDescription"),
  habitCategory: document.getElementById("habitCategory"),
  habitRepeat: document.getElementById("habitRepeat"),
  habitRepeatType: document.getElementById("habitRepeatType"),
  repeatTypeGroup: document.getElementById("repeatTypeGroup"),

  // Journal
  journalDate: document.getElementById("journalDate"),
  journalTextarea: document.getElementById("journalTextarea"),
  saveJournalBtn: document.getElementById("saveJournalBtn"),
  clearJournalBtn: document.getElementById("clearJournalBtn"),
  journalHistory: document.getElementById("journalHistory"),

  // Stats
  completionRate: document.getElementById("completionRate"),
  longestStreak: document.getElementById("longestStreak"),
  totalHabits: document.getElementById("totalHabits"),
  progressChart: document.getElementById("progressChart"),

  // Profile
  profileName: document.getElementById("profileName"),
  profileEmail: document.getElementById("profileEmail"),
  profileAvatarLarge: document.getElementById("profileAvatarLarge"),
  profilePhotoInput: document.getElementById("profilePhotoInput"),
  profileForm: document.getElementById("profileForm"),
  profileNameInput: document.getElementById("profileNameInput"),
  profileEmailInput: document.getElementById("profileEmailInput"),
  profileBirthDate: document.getElementById("profileBirthDate"),
  profileAge: document.getElementById("profileAge"),
  profileGender: document.getElementById("profileGender"),
  profilePassword: document.getElementById("profilePassword"),
  cancelProfileBtn: document.getElementById("cancelProfileBtn"),
};

// ============================================
// Utility Functions
// ============================================
const Utils = {
  formatDate(date) {
    const options = { year: "numeric", month: "long", day: "numeric" };

    // Aceita Date ou string no formato YYYY-MM-DD ou ISO completo.
    // Ao receber 'YYYY-MM-DD', new Date('YYYY-MM-DD') é interpretado como UTC
    // em muitos ambientes, causando off-by-one ao converter para horário local.
    // Para garantir que a data seja interpretada como local, se receber uma
    // string no formato YYYY-MM-DD adicionamos 'T00:00:00' (sem timezone),
    // que será interpretado como hora local pelo parser.
    try {
      if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return new Date(date + "T00:00:00").toLocaleDateString(
          "pt-BR",
          options
        );
      }

      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleDateString("pt-BR", options);
    } catch (err) {
      // Fallback simples: retorna a string original se algo falhar
      return String(date);
    }
  },

  getDaysUntilNext(proximaData) {
    if (!proximaData) return null;
    // Extrai só a parte da data se vier formato ISO
    const dataLimpa = proximaData.split("T")[0];
    const next = new Date(dataLimpa + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
    return diff;
  },

  getNextOccurrenceText(habit) {
    // Se não repete, mostra status uma vez
    if (!habit.repetir) {
      return habit.completado ? "Concluído" : "Pendente";
    }

    // Se repete mas não tem próxima data ainda
    if (!habit.proxima_data) {
      return "Marcar para agendar";
    }

    const days = this.getDaysUntilNext(habit.proxima_data);
    if (days === null) return "Sem agenda";
    if (days < 0) return "Atrasado";
    if (days === 0) return "Hoje";
    if (days === 1) return "Amanhã";
    return `Em ${days} dias`;
  },

  getRepeatTypeLabel(tipo) {
    const labels = {
      diario: "Diariamente",
      semanal: "Semanalmente",
      mensal: "Mensalmente",
    };
    return labels[tipo] || tipo;
  },

  getInitials(name) {
    if (!name || typeof name !== "string") return "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    const first = parts[0].charAt(0).toUpperCase();
    const last = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${first}${last}`;
  },

  getCategoryEmoji(categoryId) {
    const category = AppState.categories.find((c) => c.id === categoryId);
    return category ? category.emoji : "📌";
  },

  getCategoryName(categoryId) {
    const category = AppState.categories.find((c) => c.id === categoryId);
    return category ? category.nome : "Outros";
  },

  showLoading() {
    if (DOM.loadingOverlay) {
      DOM.loadingOverlay.classList.remove("hidden");
      console.log("⏳ Loading mostrado");
    }
  },

  hideLoading() {
    setTimeout(() => {
      if (DOM.loadingOverlay) {
        DOM.loadingOverlay.classList.add("hidden");
        console.log("✅ Loading escondido (opacity: 0)");

        // Remove completamente após a transição
        setTimeout(() => {
          DOM.loadingOverlay.style.display = "none";
          console.log("✅ Loading removido do DOM (display: none)");
        }, 500);
      }
    }, 500);
  },

  showToast(message, type = "success") {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Você pode implementar um sistema de toast aqui
  },
};

// ============================================
// Categories Manager
// ============================================
const CategoriesManager = {
  async load() {
    try {
      const response = await API.getCategories(AppState.user.id);

      if (response.success) {
        AppState.categories = response.data;
        this.populateCategorySelect();
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  },

  populateCategorySelect() {
    const select = DOM.habitCategory;

    // Limpa opções existentes (exceto a primeira)
    while (select.options.length > 1) {
      select.remove(1);
    }

    // Adiciona categorias
    AppState.categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = `${cat.emoji} ${cat.nome}`;
      select.appendChild(option);
    });
  },
};

// ============================================
// Habits Management
// ============================================
const HabitsManager = {
  async create(habitData) {
    const habit = {
      titulo: habitData.title,
      descricao: habitData.description || "",
      categoria: habitData.category,
      repetir: habitData.repeat,
      tipo_repeticao: habitData.repeat ? habitData.repeatType : null,
      user_id: AppState.user.id,
    };

    const response = await API.createHabit(habit);

    if (response.success) {
      await this.load();
      Utils.showToast("Hábito criado com sucesso!");
    } else {
      Utils.showToast("Erro ao criar hábito: " + response.error, "error");
    }
  },

  async load() {
    try {
      const response = await API.getHabitsByUser(AppState.user.id);

      if (response.success) {
        AppState.habits = response.data;
        // Verifica e reseta hábitos se necessário antes de renderizar
        await this.checkAndResetHabits();
        this.render();
      } else {
        console.error("Erro ao carregar hábitos:", response.error);
        AppState.habits = [];
        this.render();
      }
    } catch (error) {
      console.error("Erro ao carregar hábitos:", error);
      AppState.habits = [];
      this.render();
    }
  },

  // Verifica se algum hábito precisa ser resetado baseado na data de criação
  async checkAndResetHabits() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    for (const habit of AppState.habits) {
      // Só verifica hábitos que repetem e estão marcados como concluídos
      if (!habit.repetir || !habit.completado || !habit.tipo_repeticao) {
        continue;
      }

      // Pega a data de criação do hábito
      const dataCriacao = new Date(habit.criado_em.split('T')[0] + 'T00:00:00');
      
      let shouldReset = false;
      
      switch (habit.tipo_repeticao) {
        case 'diario':
          // Para diários, verifica se já passou para o próximo dia
          const ultimaAtualizacao = habit.atualizado_em ? new Date(habit.atualizado_em.split('T')[0] + 'T00:00:00') : dataCriacao;
          if (hoje > ultimaAtualizacao) {
            shouldReset = true;
          }
          break;
          
        case 'semanal':
          // Para semanais, verifica se já passou 7 dias desde a data de criação
          const diaDaSemana = dataCriacao.getDay(); // Dia da semana da criação (0-6)
          const diaDaSemanaHoje = hoje.getDay();
          
          // Se o dia da semana atual é o mesmo da criação e já passou pelo menos 7 dias
          if (diaDaSemanaHoje === diaDaSemana && hoje > dataCriacao) {
            // Verifica se já passou pelo menos uma semana desde a última atualização
            const ultimaAtualizacao = habit.atualizado_em ? new Date(habit.atualizado_em.split('T')[0] + 'T00:00:00') : dataCriacao;
            const diffDias = Math.floor((hoje - ultimaAtualizacao) / (1000 * 60 * 60 * 24));
            if (diffDias >= 7) {
              shouldReset = true;
            }
          }
          break;
          
        case 'mensal':
          // Para mensais, verifica se hoje é o mesmo dia do mês da criação
          const diaDoMes = dataCriacao.getDate();
          const diaDoMesHoje = hoje.getDate();
          
          // Se o dia do mês atual é o mesmo da criação
          if (diaDoMesHoje === diaDoMes && hoje > dataCriacao) {
            // Verifica se já passou pelo menos um mês desde a última atualização
            const ultimaAtualizacao = habit.atualizado_em ? new Date(habit.atualizado_em.split('T')[0] + 'T00:00:00') : dataCriacao;
            const diffMeses = (hoje.getFullYear() - ultimaAtualizacao.getFullYear()) * 12 + 
                              (hoje.getMonth() - ultimaAtualizacao.getMonth());
            if (diffMeses >= 1) {
              shouldReset = true;
            }
          }
          break;
      }
      
      // Se deve resetar, desmarca o hábito
      if (shouldReset) {
        console.log(`🔄 Resetando hábito: ${habit.titulo}`);
        await API.toggleHabitComplete(habit.id);
      }
    }
  },

  async update(id, habitData) {
    const updateData = {
      titulo: habitData.title,
      descricao: habitData.description || "",
      categoria: habitData.category,
      repetir: habitData.repeat,
      tipo_repeticao: habitData.repeat ? habitData.repeatType : null,
    };

    const response = await API.updateHabit(id, updateData);

    if (response.success) {
      await this.load();
      Utils.showToast("Hábito atualizado com sucesso!");
    } else {
      Utils.showToast("Erro ao atualizar hábito: " + response.error, "error");
    }
  },

  async delete(id) {
    const response = await API.deleteHabit(id);

    if (response.success) {
      await this.load();
      Utils.showToast("Hábito excluído com sucesso!");
    } else {
      Utils.showToast("Erro ao excluir hábito: " + response.error, "error");
    }
  },

  async toggleComplete(id) {
    const response = await API.toggleHabitComplete(id);

    if (response.success) {
      await this.load();
    } else {
      Utils.showToast("Erro ao atualizar status: " + response.error, "error");
    }
  },

  search(query) {
    const filtered = AppState.habits.filter(
      (habit) =>
        habit.titulo.toLowerCase().includes(query.toLowerCase()) ||
        (habit.descricao &&
          habit.descricao.toLowerCase().includes(query.toLowerCase()))
    );
    this.renderHabits(filtered);
  },

  renderHabits(habitsToRender = AppState.habits) {
    console.log("🎨 Renderizando hábitos:", habitsToRender.length);
    console.log("🎯 DOM.habitsGrid:", DOM.habitsGrid);

    if (!DOM.habitsGrid) {
      console.error("❌ habitsGrid não encontrado no DOM!");
      return;
    }

    DOM.habitsGrid.innerHTML = "";

    if (habitsToRender.length === 0) {
      console.log("📭 Nenhum hábito para renderizar");
      DOM.habitsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #64748B;">
                    <i class='bx bx-category' style='font-size: 64px; opacity: 0.5;'></i>
                    <h3 style='margin: 20px 0 10px; font-size: 20px;'>Nenhum hábito encontrado</h3>
                    <p>Clique em "Novo Hábito" para começar!</p>
                </div>
            `;
      return;
    }

    habitsToRender.forEach((habit) => {
      const card = this.createHabitCard(habit);
      DOM.habitsGrid.appendChild(card);
    });

    console.log("✅ Hábitos renderizados na grid");
  },

  createHabitCard(habit) {
    const card = document.createElement("div");
    card.className = "habit-card";

    const nextText = Utils.getNextOccurrenceText(habit);
    const isDueSoon =
      nextText === "Hoje" || nextText === "Amanhã" || nextText === "Atrasado";

    // Informação de repetição
    let repeatInfo = "";
    if (habit.repetir && habit.tipo_repeticao) {
      repeatInfo = `<span class="habit-repeat-badge">${Utils.getRepeatTypeLabel(
        habit.tipo_repeticao
      )}</span>`;
    }

    card.innerHTML = `
            <div class="habit-card-header">
                <div>
                    <h3 class="habit-title">${habit.titulo}</h3>
                    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                        <span class="habit-category">
                            ${Utils.getCategoryEmoji(
                              habit.categoria
                            )} ${Utils.getCategoryName(habit.categoria)}
                        </span>
                        ${repeatInfo}
                    </div>
                </div>
                <div class="habit-actions">
                    <button class="icon-btn" onclick="HabitsManager.openEditModal(${
                      habit.id
                    })" aria-label="Editar hábito">
                        <i class='bx bx-edit'></i>
                    </button>
                    <button class="icon-btn delete" onclick="HabitsManager.openDeleteModal(${
                      habit.id
                    })" aria-label="Excluir hábito">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            </div>
            ${
              habit.descricao
                ? `<p class="habit-description">${habit.descricao}</p>`
                : ""
            }
            <div class="habit-footer">
                <div class="habit-status">
                    <div class="status-checkbox ${
                      habit.completado ? "completed" : ""
                    }" onclick="HabitsManager.toggleComplete(${habit.id})">
                        <i class='bx bx-check'></i>
                    </div>
                </div>
                <span class="habit-next ${
                  isDueSoon ? "due-soon" : ""
                }">${nextText}</span>
            </div>
        `;

    return card;
  },

  openEditModal(id) {
    const habit = AppState.habits.find((h) => h.id === id);
    if (habit) {
      AppState.editingHabitId = id;
      DOM.modalTitle.textContent = "Editar Hábito";
      DOM.habitTitle.value = habit.titulo;
      DOM.habitDescription.value = habit.descricao || "";
      DOM.habitCategory.value = habit.categoria;
      DOM.habitRepeat.value = habit.repetir ? "true" : "false";

      // Mostra/esconde campo de tipo de repetição
      if (habit.repetir) {
        DOM.repeatTypeGroup.style.display = "block";
        DOM.habitRepeatType.value = habit.tipo_repeticao || "diario";
      } else {
        DOM.repeatTypeGroup.style.display = "none";
      }

      UI.openModal(DOM.habitModal);
    }
  },

  openDeleteModal(id) {
    AppState.deletingHabitId = id;
    UI.openModal(DOM.deleteModal);
  },

  render() {
    this.renderHabits();
    StatsManager.update();
  },
};

// ============================================
// Journal Management
// ============================================
const JournalManager = {
  async load() {
    try {
      const response = await API.getJournalEntriesByUser(AppState.user.id);

      if (response.success) {
        AppState.journalEntries = response.data;
        this.render();
      }
    } catch (error) {
      console.error("Erro ao carregar entradas do diário:", error);
    }
  },

  async save() {
    const content = DOM.journalTextarea.value.trim();
    if (!content) {
      Utils.showToast("Por favor, escreva algo antes de salvar", "error");
      return;
    }

    // Usa data local (YYYY-MM-DD) para evitar problemas de fuso horário com toISOString()
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const localDateISO = `${yyyy}-${mm}-${dd}`;

    const entryData = {
      conteudo: content,
      user_id: AppState.user.id,
      data: localDateISO,
    };

    const response = await API.createJournalEntry(entryData);

    if (response.success) {
      DOM.journalTextarea.value = "";
      await this.load();
      Utils.showToast("Entrada salva com sucesso!");
    } else {
      Utils.showToast("Erro ao salvar entrada: " + response.error, "error");
    }
  },

  openEditModal(id) {
    const entry = AppState.journalEntries.find((e) => e.id === id);
    if (entry) {
      AppState.editingJournalId = id;
      DOM.editJournalContent.value = entry.conteudo;
      UI.openModal(DOM.editJournalModal);
    }
  },

  async update(id, content) {
    const entry = AppState.journalEntries.find((e) => e.id === id);
    if (!entry) return;

    // Normaliza a data para YYYY-MM-DD (caso venha do banco com timestamp)
    let dataNormalizada = entry.data;
    if (typeof dataNormalizada === 'string') {
      dataNormalizada = dataNormalizada.split('T')[0];
    }

    const updateData = {
      conteudo: content,
      data: dataNormalizada,
    };

    const response = await API.updateJournalEntry(id, updateData);

    if (response.success) {
      await this.load();
      Utils.showToast("Entrada atualizada com sucesso!");
    } else {
      Utils.showToast("Erro ao atualizar entrada: " + response.error, "error");
    }
  },

  openDeleteModal(id) {
    AppState.deletingJournalId = id;
    UI.openModal(DOM.deleteJournalModal);
  },

  async delete(id) {
    const response = await API.deleteJournalEntry(id, AppState.user.id);

    if (response.success) {
      await this.load();
      Utils.showToast("Entrada excluída com sucesso!");
    } else {
      Utils.showToast("Erro ao excluir entrada: " + response.error, "error");
    }
  },

  clear() {
    DOM.journalTextarea.value = "";
  },

  render() {
    DOM.journalDate.textContent = Utils.formatDate(new Date());

    // Auto-resize textarea
    this.setupAutoResize();

    // Render history
    DOM.journalHistory.innerHTML = "";

    if (AppState.journalEntries.length === 0) {
      DOM.journalHistory.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #64748B;">
                    <i class='bx bx-book-open' style='font-size: 48px; opacity: 0.5;'></i>
                    <p style='margin-top: 16px;'>Nenhuma entrada ainda. Comece a escrever!</p>
                </div>
            `;
      return;
    }

    AppState.journalEntries.forEach((entry) => {
      const entryEl = document.createElement("div");
      entryEl.className = "journal-history-item";
      entryEl.innerHTML = `
                <div class="journal-entry-header">
                    <div class="date">${Utils.formatDate(entry.data)}</div>
                    <div class="journal-entry-actions">
                        <button class="icon-btn" onclick="JournalManager.openEditModal(${entry.id})" aria-label="Editar entrada">
                            <i class='bx bx-edit'></i>
                        </button>
                        <button class="icon-btn delete" onclick="JournalManager.openDeleteModal(${entry.id})" aria-label="Excluir entrada">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                </div>
                <div class="content">${entry.conteudo}</div>
            `;
      DOM.journalHistory.appendChild(entryEl);
    });
  },

  setupAutoResize() {
    DOM.journalTextarea.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });
  },
};

// ============================================
// Image Upload Manager
// ============================================
const ImageUploader = {
  async uploadToCloudinary(file) {
    try {
      // Valida o arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }

      // Limita tamanho a 5MB
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Imagem deve ter no máximo 5MB');
      }

      // Comprime a imagem antes de enviar
      const compressedFile = await this.compressImage(file);

      // Prepara o FormData para upload
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', CLOUDINARY_CONFIG.folder);

      // Faz o upload para Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      return data.secure_url; // URL da imagem

    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  },

  async compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Define tamanho máximo
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          
          let width = img.width;
          let height = img.height;
          
          // Redimensiona mantendo proporção
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Desenha a imagem redimensionada
          ctx.drawImage(img, 0, 0, width, height);
          
          // Converte para Blob com qualidade 0.8
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          }, 'image/jpeg', 0.8);
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  showPreview(file, targetElement) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Remove iniciais e mostra imagem
      targetElement.style.backgroundImage = `url(${e.target.result})`;
      targetElement.style.backgroundSize = 'cover';
      targetElement.style.backgroundPosition = 'center';
      targetElement.textContent = '';
    };
    reader.readAsDataURL(file);
  }
};

// ============================================
// Profile Management
// ============================================
const ProfileManager = {
  load() {
    const user = AppState.user;
    if (!user) return;

    // Atualiza cabeçalho do perfil
    DOM.profileName.textContent = user.nome || "Usuário";
    DOM.profileEmail.textContent = user.email || "";

    // Exibe foto ou iniciais
    if (user.foto_perfil) {
      DOM.profileAvatarLarge.style.backgroundImage = `url(${user.foto_perfil})`;
      DOM.profileAvatarLarge.style.backgroundSize = 'cover';
      DOM.profileAvatarLarge.style.backgroundPosition = 'center';
      DOM.profileAvatarLarge.style.color = 'transparent';
      DOM.profileAvatarLarge.textContent = '';
    } else {
      DOM.profileAvatarLarge.style.backgroundImage = '';
      DOM.profileAvatarLarge.style.backgroundSize = '';
      DOM.profileAvatarLarge.style.backgroundPosition = '';
      DOM.profileAvatarLarge.style.color = '';
      const initials = Utils.getInitials(user.nome || "");
      DOM.profileAvatarLarge.textContent = initials || "U";
    }

    // Preenche formulário
    DOM.profileNameInput.value = user.nome || "";
    DOM.profileEmailInput.value = user.email || "";
    DOM.profileBirthDate.value = user.data_nasc || "";
    DOM.profileAge.value = user.idade || "";
    DOM.profileGender.value = user.sexo || "";
    DOM.profilePassword.value = "";
  },

  async save(profileData) {
    try {
      // Monta objeto de atualização (só envia campos não vazios)
      const updateData = {
        nome: profileData.nome,
        email: profileData.email,
      };

      if (profileData.data_nasc) updateData.data_nasc = profileData.data_nasc;
      if (profileData.idade) updateData.idade = parseInt(profileData.idade);
      if (profileData.sexo) updateData.sexo = profileData.sexo;
      if (profileData.senha && profileData.senha.length >= 6) {
        updateData.senha = profileData.senha;
      }

      // Chama API para atualizar usuário (assumindo endpoint PUT /api/users/:id)
      const response = await API.updateUser(AppState.user.id, updateData);

      if (response.success) {
        // Atualiza dados locais
        const updatedUser = { ...AppState.user, ...updateData };
        AppState.user = updatedUser;
        Auth.saveUser(updatedUser);

        // Atualiza header principal
        DOM.userName.textContent = updatedUser.nome;
        if (updatedUser.foto_perfil) {
          DOM.avatar.style.backgroundImage = `url(${updatedUser.foto_perfil})`;
          DOM.avatar.style.backgroundSize = 'cover';
          DOM.avatar.style.backgroundPosition = 'center';
          DOM.avatar.style.color = 'transparent';
          DOM.avatar.textContent = '';
        } else {
          DOM.avatar.style.backgroundImage = '';
          DOM.avatar.style.backgroundSize = '';
          DOM.avatar.style.backgroundPosition = '';
          DOM.avatar.style.color = '';
          const initials = Utils.getInitials(updatedUser.nome);
          DOM.avatar.textContent = initials;
        }

        // Recarrega página de perfil
        this.load();

        Utils.showToast("Perfil atualizado com sucesso!");
      } else {
        Utils.showToast("Erro ao atualizar perfil: " + response.error, "error");
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      Utils.showToast("Erro ao atualizar perfil", "error");
    }
  },

  cancel() {
    // Recarrega dados originais do usuário
    this.load();
  },
};

// ============================================
// Statistics Management
// ============================================
const StatsManager = {
  chart: null,

  update() {
    this.updateSummary();
    this.updateChart();
  },

  updateSummary() {
    const totalHabits = AppState.habits.length;
    const completedHabits = AppState.habits.filter((h) => h.completado).length;
    const completionRate =
      totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    // Encontra a maior sequência
    const maxStreak = AppState.habits.reduce(
      (max, h) => Math.max(max, h.melhor_sequencia || 0),
      0
    );

    DOM.totalHabits.textContent = totalHabits;
    DOM.completionRate.textContent = `${completionRate}%`;
    DOM.longestStreak.textContent = `${maxStreak} dias`;
  },

  updateChart() {
    const ctx = DOM.progressChart.getContext("2d");

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const data = this.generateWeeklyData();

    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Hábitos Concluídos",
            data: data,
            borderColor: "#00BFA5",
            backgroundColor: "rgba(0, 191, 165, 0.1)",
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#00BFA5",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#1A202C",
            padding: 12,
            borderRadius: 8,
            titleFont: {
              size: 14,
            },
            bodyFont: {
              size: 13,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: {
                size: 12,
              },
              color: "#64748B",
            },
            grid: {
              color: "#E0F7F4",
              drawBorder: false,
            },
          },
          x: {
            ticks: {
              font: {
                size: 12,
              },
              color: "#64748B",
            },
            grid: {
              display: false,
            },
          },
        },
      },
    });
  },

  generateWeeklyData() {
    const totalHabits = AppState.habits.length;
    const completedCount = AppState.habits.filter((h) => h.completado).length;

    // Gera dados simulados baseados nos hábitos atuais
    return Array.from({ length: 7 }, () =>
      Math.floor(Math.random() * (completedCount + 1))
    );
  },
};

// ============================================
// UI Management
// ============================================
const UI = {
  init() {
    this.setupNavigation();
    this.setupModals();
    this.setupForms();
    this.setupEventListeners();
  },

  setupNavigation() {
    DOM.navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const page = item.getAttribute("data-page");
        this.navigateTo(page);
        // Fecha o menu em telas pequenas após navegar
        DOM.sidebar.classList.remove("open");
      });
    });

    DOM.menuToggle.addEventListener("click", () => {
      DOM.sidebar.classList.toggle("open");
    });

    // Botão de fechar sidebar em mobile
    if (DOM.closeSidebar) {
      DOM.closeSidebar.addEventListener("click", () => {
        DOM.sidebar.classList.remove("open");
      });
    }

    document.addEventListener("click", (e) => {
      if (
        !DOM.sidebar.contains(e.target) &&
        !DOM.menuToggle.contains(e.target)
      ) {
        DOM.sidebar.classList.remove("open");
      }
    });
  },

  navigateTo(page) {
    DOM.navItems.forEach((item) => {
      item.classList.toggle("active", item.getAttribute("data-page") === page);
    });

    document.querySelectorAll(".page-content").forEach((pageEl) => {
      pageEl.classList.remove("active");
    });

    const pageMap = {
      habits: {
        el: DOM.habitsPage,
        title: "Meus Hábitos",
        subtitle: "Gerencie seus hábitos diários",
      },
      journal: {
        el: DOM.journalPage,
        title: "Diário",
        subtitle: "Registre suas reflexões",
      },
      stats: {
        el: DOM.statsPage,
        title: "Estatísticas",
        subtitle: "Acompanhe seu progresso",
      },
      profile: {
        el: DOM.profilePage,
        title: "Perfil",
        subtitle: "Atualize suas informações",
      },
    };

    const pageInfo = pageMap[page];
    if (pageInfo) {
      pageInfo.el.classList.add("active");
      DOM.pageTitle.textContent = pageInfo.title;
      DOM.pageSubtitle.textContent = pageInfo.subtitle;
      AppState.currentPage = page;

      if (page === "journal" && AppState.journalEntries.length === 0) {
        JournalManager.load();
      }

      if (page === "profile") {
        ProfileManager.load();
      }
    }
  },

  setupModals() {
    // Garante que modais comecem escondidos
    [DOM.habitModal, DOM.deleteModal, DOM.logoutModal, DOM.deleteJournalModal, DOM.editJournalModal].forEach((modal) => {
      if (modal) {
        modal.style.display = "none";
        modal.classList.remove("active", "show");
      }
    });

    DOM.addHabitBtn.addEventListener("click", () => this.openHabitModal());

    // Habit Modal
    DOM.closeModal.addEventListener("click", () =>
      this.closeModal(DOM.habitModal)
    );
    DOM.cancelModal.addEventListener("click", () =>
      this.closeModal(DOM.habitModal)
    );

    // Delete Habit Modal
    DOM.closeDeleteModal.addEventListener("click", () =>
      this.closeModal(DOM.deleteModal)
    );
    DOM.cancelDelete.addEventListener("click", () =>
      this.closeModal(DOM.deleteModal)
    );
    DOM.confirmDelete.addEventListener("click", () => {
      if (AppState.deletingHabitId) {
        HabitsManager.delete(AppState.deletingHabitId);
        this.closeModal(DOM.deleteModal);
        AppState.deletingHabitId = null;
      }
    });

    // Logout Modal
    DOM.closeLogoutModal.addEventListener("click", () =>
      this.closeModal(DOM.logoutModal)
    );
    DOM.cancelLogout.addEventListener("click", () =>
      this.closeModal(DOM.logoutModal)
    );
    DOM.confirmLogout.addEventListener("click", () => {
      Auth.logout();
    });

    // Delete Journal Modal
    DOM.closeDeleteJournalModal.addEventListener("click", () =>
      this.closeModal(DOM.deleteJournalModal)
    );
    DOM.cancelDeleteJournal.addEventListener("click", () =>
      this.closeModal(DOM.deleteJournalModal)
    );
    DOM.confirmDeleteJournal.addEventListener("click", () => {
      if (AppState.deletingJournalId) {
        JournalManager.delete(AppState.deletingJournalId);
        this.closeModal(DOM.deleteJournalModal);
        AppState.deletingJournalId = null;
      }
    });

    // Edit Journal Modal
    DOM.closeEditJournalModal.addEventListener("click", () =>
      this.closeModal(DOM.editJournalModal)
    );
    DOM.cancelEditJournal.addEventListener("click", () =>
      this.closeModal(DOM.editJournalModal)
    );
    DOM.editJournalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (AppState.editingJournalId) {
        const content = DOM.editJournalContent.value.trim();
        if (content) {
          JournalManager.update(AppState.editingJournalId, content);
          this.closeModal(DOM.editJournalModal);
          AppState.editingJournalId = null;
        }
      }
    });

    // Click outside to close
    [DOM.habitModal, DOM.deleteModal, DOM.logoutModal, DOM.deleteJournalModal, DOM.editJournalModal].forEach((modal) => {
      if (modal) {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            this.closeModal(modal);
          }
        });
      }
    });
  },

  openHabitModal() {
    AppState.editingHabitId = null;
    DOM.modalTitle.textContent = "Novo Hábito";
    DOM.habitForm.reset();
    this.openModal(DOM.habitModal);
  },

  openModal(modal) {
    if (!modal) return;
    modal.classList.add("active");
    modal.style.display = "flex";
    console.log("✅ Modal aberto:", modal.id);
  },

  closeModal(modal) {
    if (!modal) return;
    // Add 'closing' class to trigger fade-out while keeping layout (centered)
    modal.classList.add("closing");
    // Wait for the CSS opacity transition to finish, then remove classes and hide
    setTimeout(() => {
      modal.classList.remove("active", "closing");
      modal.style.display = "none";
      console.log("✅ Modal fechado:", modal.id);
    }, 300);
  },

  setupForms() {
    // Toggle do campo de tipo de repetição
    DOM.habitRepeat.addEventListener("change", () => {
      const shouldRepeat = DOM.habitRepeat.value === "true";
      DOM.repeatTypeGroup.style.display = shouldRepeat ? "block" : "none";
    });

    DOM.habitForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const repeatValue = DOM.habitRepeat.value === "true";
      const habitData = {
        title: DOM.habitTitle.value.trim(),
        description: DOM.habitDescription.value.trim(),
        category: DOM.habitCategory.value,
        repeat: repeatValue,
        repeatType: repeatValue ? DOM.habitRepeatType.value : null,
      };

      if (AppState.editingHabitId) {
        HabitsManager.update(AppState.editingHabitId, habitData);
      } else {
        HabitsManager.create(habitData);
      }

      this.closeModal(DOM.habitModal);
      DOM.habitForm.reset();
      DOM.repeatTypeGroup.style.display = "none"; // Reset display
      AppState.editingHabitId = null;
    });
  },

  setupEventListeners() {
    DOM.searchHabits.addEventListener("input", (e) => {
      HabitsManager.search(e.target.value);
    });

    DOM.saveJournalBtn.addEventListener("click", () => {
      JournalManager.save();
    });

    DOM.clearJournalBtn.addEventListener("click", () => {
      JournalManager.clear();
    });

    DOM.logoutBtn.addEventListener("click", () => {
      UI.openModal(DOM.logoutModal);
    });

    // Profile form
    DOM.profileForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const profileData = {
        nome: DOM.profileNameInput.value.trim(),
        email: DOM.profileEmailInput.value.trim(),
        data_nasc: DOM.profileBirthDate.value,
        idade: DOM.profileAge.value,
        sexo: DOM.profileGender.value,
        senha: DOM.profilePassword.value,
      };

      if (!profileData.nome || !profileData.email) {
        Utils.showToast("Nome e email são obrigatórios", "error");
        return;
      }

      if (profileData.senha && profileData.senha.length < 6) {
        Utils.showToast("A senha deve ter no mínimo 6 caracteres", "error");
        return;
      }

      ProfileManager.save(profileData);
    });

    DOM.cancelProfileBtn.addEventListener("click", () => {
      ProfileManager.cancel();
    });

    // Upload de foto de perfil
    DOM.profilePhotoInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        Utils.showLoading();
        
        // Mostra preview imediato
        ImageUploader.showPreview(file, DOM.profileAvatarLarge);
        
        // Faz upload para Cloudinary
        const imageUrl = await ImageUploader.uploadToCloudinary(file);
        
        // Atualiza no banco de dados
        const response = await API.updateUser(AppState.user.id, {
          foto_perfil: imageUrl
        });

        if (response.success) {
          // Atualiza estado local
          AppState.user.foto_perfil = imageUrl;
          Auth.saveUser(AppState.user);
          
          // Atualiza avatar do header
          const headerAvatar = DOM.avatar;
          if (headerAvatar) {
            headerAvatar.style.backgroundImage = `url(${imageUrl})`;
            headerAvatar.style.backgroundSize = 'cover';
            headerAvatar.style.backgroundPosition = 'center';
            headerAvatar.textContent = '';
          }
          
          Utils.showToast('Foto de perfil atualizada com sucesso!');
        } else {
          throw new Error(response.error || 'Erro ao atualizar foto');
        }
        
        Utils.hideLoading();
      } catch (error) {
        console.error('Erro ao fazer upload da foto:', error);
        Utils.showToast(error.message || 'Erro ao fazer upload da foto', 'error');
        Utils.hideLoading();
        
        // Reverte preview em caso de erro
        ProfileManager.load();
      }
      
      // Limpa o input
      e.target.value = '';
    });
  },
};

// ============================================
// App Initialization
// ============================================
const App = {
  async init() {
    console.log("📍 App.init() iniciado");

    try {
      // Verifica autenticação
      console.log("🔐 Verificando autenticação...");
      if (!Auth || !Auth.requireAuth()) {
        console.log("❌ Não autenticado, redirecionando...");
        return;
      }

      console.log("✅ Autenticação OK, continuando...");

      Utils.showLoading();
      console.log("⏳ Loading overlay mostrado");

      // Carrega dados do usuário
      AppState.user = Auth.getUser();
      console.log("🔍 AppState.user carregado:", AppState.user);

      if (!AppState.user) {
        console.log("❌ Usuário não encontrado no localStorage");
        Auth.logout();
        return;
      }

      console.log("✅ User ID:", AppState.user.id);

      // Atualiza nome do usuário no header
      DOM.userName.textContent = AppState.user.nome || "Usuário";
      // Preenche avatar com foto ou iniciais
      try {
        if (DOM.avatar) {
          if (AppState.user.foto_perfil) {
            DOM.avatar.style.backgroundImage = `url(${AppState.user.foto_perfil})`;
            DOM.avatar.style.backgroundSize = 'cover';
            DOM.avatar.style.backgroundPosition = 'center';
            DOM.avatar.style.color = 'transparent';
            DOM.avatar.textContent = '';
          } else {
            DOM.avatar.style.backgroundImage = '';
            DOM.avatar.style.backgroundSize = '';
            DOM.avatar.style.backgroundPosition = '';
            DOM.avatar.style.color = '';
            const initials = Utils.getInitials(AppState.user.nome || "");
            DOM.avatar.textContent = initials || "U";
          }
          DOM.avatar.setAttribute("title", AppState.user.nome || "Usuário");
        }
      } catch (err) {
        console.warn("Não foi possível setar avatar:", err);
      }

      // Inicializa UI
      UI.init();

      // Carrega dados
      await this.loadData();

      // Mostra o container principal
      DOM.mainContainer.classList.add("visible");
      console.log("✅ Container principal visível");

      Utils.hideLoading();
    } catch (error) {
      console.error("❌ Erro ao inicializar aplicação:", error);
      Utils.hideLoading();
      Utils.showToast("Erro ao carregar aplicação", "error");
    }
  },

  async loadData() {
    try {
      console.log("📥 Iniciando carregamento de dados...");

      await Promise.all([
        CategoriesManager.load(),
        HabitsManager.load(),
        JournalManager.load(),
      ]);

      console.log("✅ Dados carregados:");
      console.log("  - Categorias:", AppState.categories.length);
      console.log("  - Hábitos:", AppState.habits.length);
      console.log("  - Journal:", AppState.journalEntries.length);

      StatsManager.update();
      console.log("✅ Estatísticas atualizadas");
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      Utils.showToast("Erro ao carregar dados do servidor", "error");
    }
  },
};

// ============================================
// Start App
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM Carregado, iniciando app...");
  console.log("📦 Auth disponível?", typeof Auth !== "undefined");
  console.log("📦 API disponível?", typeof API !== "undefined");

  // Fallback: esconde loading após 10 segundos se algo der errado
  setTimeout(() => {
    const loading = document.getElementById("loadingOverlay");
    if (loading && !loading.classList.contains("hidden")) {
      console.warn("⚠️ Loading ainda visível após 10s, forçando hide...");
      loading.classList.add("hidden");
    }
  }, 10000);

  App.init();
});
