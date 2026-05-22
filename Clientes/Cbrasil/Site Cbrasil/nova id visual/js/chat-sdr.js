const SDRChat = {
  currentStep: 0,
  answers: {},
  steps: [
    {
      id: 'welcome',
      type: 'message',
      text: 'Olá! Sou o assistente da C. Brasil Contabilidade. Vou te ajudar a encontrar a solução certa para a sua organização.',
      next: 'nome'
    },
    {
      id: 'nome',
      type: 'input',
      text: 'Qual o seu nome?',
      placeholder: 'Digite seu nome',
      variable: 'nome'
    },
    {
      id: 'tipo_organizacao',
      type: 'buttons',
      text: 'Qual o tipo da sua organização, {{nome}}?',
      variable: 'tipo_organizacao',
      options: [
        'Igreja ou comunidade religiosa',
        'ONG ou associação',
        'Fundação',
        'Empresa de serviços',
        'Outro'
      ]
    },
    {
      id: 'nome_organizacao',
      type: 'input',
      text: 'Qual o nome da sua organização?',
      placeholder: 'Nome da organização',
      variable: 'nome_organizacao'
    },
    {
      id: 'necessidade',
      type: 'buttons',
      text: 'O que você mais precisa neste momento?',
      variable: 'necessidade',
      options: [
        'Contabilidade mensal completa',
        'Prestação de contas',
        'Abertura ou regularização',
        'Troca de contador',
        'Certificação (CEBAS, OSCIP)',
        'Consultoria pontual'
      ]
    },
    {
      id: 'tamanho',
      type: 'buttons',
      text: 'Quantas pessoas trabalham na organização?',
      variable: 'tamanho',
      options: [
        'Até 5',
        '6 a 20',
        '21 a 50',
        'Mais de 50'
      ]
    },
    {
      id: 'urgencia',
      type: 'buttons',
      text: 'Qual a urgência dessa demanda?',
      variable: 'urgencia',
      options: [
        'Urgente (preciso para ontem)',
        'Próximo mês',
        'Estou pesquisando'
      ]
    },
    {
      id: 'contato',
      type: 'input',
      text: 'Para enviarmos uma proposta, qual o melhor contato? (WhatsApp ou e-mail)',
      placeholder: '(11) 99999-9999 ou email@exemplo.com',
      variable: 'contato'
    },
    {
      id: 'fim',
      type: 'final',
      text: 'Obrigado, {{nome}}! Registramos tudo. Nossa equipe vai analisar e entrar em contato em até 24 horas úteis.',
      whatsapp: true
    }
  ],

  init: function(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.container.innerHTML = '';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.height = '100%';

    this.messagesArea = document.createElement('div');
    this.messagesArea.className = 'sdr-messages';
    this.container.appendChild(this.messagesArea);

    this.inputArea = document.createElement('div');
    this.inputArea.className = 'sdr-input-area';
    this.container.appendChild(this.inputArea);

    this.showStep(0);
  },

  showStep: function(index) {
    this.currentStep = index;
    var step = this.steps[index];
    if (!step) return;

    var text = this.replaceVars(step.text);

    if (step.type === 'message') {
      this.addBotMessage(text);
      var self = this;
      setTimeout(function() {
        self.showStep(index + 1);
      }, 800);
      return;
    }

    if (step.type === 'final') {
      this.addBotMessage(text);
      this.inputArea.innerHTML = '';
      if (step.whatsapp) {
        var waBtn = document.createElement('a');
        waBtn.href = 'https://wa.me/5511970353989?text=Ola! Meu nome e ' + encodeURIComponent(this.answers.nome || '') + ' e gostaria de falar sobre ' + encodeURIComponent(this.answers.necessidade || 'servicos contabeis');
        waBtn.target = '_blank';
        waBtn.className = 'sdr-wa-btn';
        waBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Falar no WhatsApp';
        this.inputArea.appendChild(waBtn);
      }
      this.submitToWebhook();
      return;
    }

    this.addBotMessage(text);
    this.renderInput(step);
  },

  addBotMessage: function(text) {
    var msg = document.createElement('div');
    msg.className = 'sdr-msg sdr-msg-bot';
    msg.textContent = text;
    this.messagesArea.appendChild(msg);
    this.scrollToBottom();
  },

  addUserMessage: function(text) {
    var msg = document.createElement('div');
    msg.className = 'sdr-msg sdr-msg-user';
    msg.textContent = text;
    this.messagesArea.appendChild(msg);
    this.scrollToBottom();
  },

  renderInput: function(step) {
    this.inputArea.innerHTML = '';
    var self = this;

    if (step.type === 'input') {
      var form = document.createElement('form');
      form.className = 'sdr-form';
      var input = document.createElement('input');
      input.type = 'text';
      input.placeholder = step.placeholder || 'Digite aqui...';
      input.className = 'sdr-text-input';
      input.autocomplete = 'off';
      var btn = document.createElement('button');
      btn.type = 'submit';
      btn.className = 'sdr-send-btn';
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
      form.appendChild(input);
      form.appendChild(btn);
      this.inputArea.appendChild(form);
      input.focus();

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var val = input.value.trim();
        if (!val) return;
        self.answers[step.variable] = val;
        self.addUserMessage(val);
        self.showStep(self.currentStep + 1);
      });
    }

    if (step.type === 'buttons') {
      var btnsContainer = document.createElement('div');
      btnsContainer.className = 'sdr-buttons';
      step.options.forEach(function(opt) {
        var btn = document.createElement('button');
        btn.className = 'sdr-option-btn';
        btn.textContent = opt;
        btn.addEventListener('click', function() {
          self.answers[step.variable] = opt;
          self.addUserMessage(opt);
          self.showStep(self.currentStep + 1);
        });
        btnsContainer.appendChild(btn);
      });
      this.inputArea.appendChild(btnsContainer);
    }
  },

  replaceVars: function(text) {
    var self = this;
    return text.replace(/\{\{(\w+)\}\}/g, function(match, key) {
      return self.answers[key] || '';
    });
  },

  scrollToBottom: function() {
    this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
  },

  calcScore: function() {
    var score = 0;
    if (this.answers.urgencia === 'Urgente (preciso para ontem)') score += 3;
    if (this.answers.urgencia === 'Próximo mês') score += 2;
    var tipo = this.answers.tipo_organizacao || '';
    if (tipo.indexOf('Igreja') >= 0 || tipo.indexOf('ONG') >= 0 || tipo.indexOf('Fundação') >= 0) score += 2;
    if (this.answers.necessidade === 'Contabilidade mensal completa') score += 3;
    if (this.answers.necessidade === 'Troca de contador') score += 2;
    if (this.answers.tamanho === '21 a 50' || this.answers.tamanho === 'Mais de 50') score += 1;
    return score;
  },

  submitToWebhook: function() {
    var score = this.calcScore();
    var data = {
      nome: this.answers.nome || '',
      tipo_organizacao: this.answers.tipo_organizacao || '',
      nome_organizacao: this.answers.nome_organizacao || '',
      necessidade: this.answers.necessidade || '',
      tamanho: this.answers.tamanho || '',
      urgencia: this.answers.urgencia || '',
      contato: this.answers.contato || '',
      score: score,
      status: 'novo'
    };

    fetch('https://nktcuryuogkgpccdrpal.supabase.co/functions/v1/submit-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(function() {});

    console.log('[SDR Lead] score=' + score, data);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  var embed = document.getElementById('typebot-embed');
  if (embed) {
    SDRChat.init('typebot-embed');
  }
});
