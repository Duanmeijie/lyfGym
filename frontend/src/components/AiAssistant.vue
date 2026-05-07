<template>
  <div class="ai-assistant">
    <button v-if="!isOpen" class="chat-toggle" @click="isOpen = true">
      小飞
    </button>
    
    <div v-else class="chat-window">
      <div class="chat-header">
        <span>小飞</span>
        <button class="close-btn" @click="isOpen = false">&times;</button>
      </div>
      
      <div class="model-selector">
        <select v-model="selectedModel">
          <option value="minimax-m2.5-free">minimax-m2.5-free (推荐)</option>
        </select>
      </div>
      
      <div class="chat-body" ref="chatBody">
        <div 
          v-for="(msg, index) in chatHistory" 
          :key="index" 
          class="message" 
          :class="msg.role === 'user' ? 'user' : 'assistant'"
        >
          <div class="content">{{ msg.content }}</div>
        </div>
        <div v-if="loading" class="message assistant">
          <div class="content">正在思考...</div>
        </div>
      </div>
      
      <div class="chat-footer">
        <input 
          v-model="inputText" 
          placeholder="问我什么都可以..." 
          @keyup.enter="sendMessage"
          :disabled="loading"
        />
        <button @click="sendMessage" :disabled="loading">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const isOpen = ref(false)
const inputText = ref('')
const selectedModel = ref('minimax-m2.5-free')
const chatHistory = ref([
  { role: 'assistant', content: '你好！我是你的健身助手小飞。你可以问我关于会员、教练的问题，或者寻求管理建议！' }
])
const loading = ref(false)
const chatBody = ref(null)

const sendMessage = async () => {
  if (!inputText.value.trim() || loading.value) return
  
  const userMsg = inputText.value
  chatHistory.value.push({ role: 'user', content: userMsg })
  inputText.value = ''
  loading.value = true
  
  await nextTick()
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
  
  try {
    const history = chatHistory.value.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))
    
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMsg,
        model: selectedModel.value,
        history: history
      })
    })
    
    const data = await response.json()
    chatHistory.value.push({ role: 'assistant', content: data.reply })
  } catch (error) {
    chatHistory.value.push({ role: 'assistant', content: '抱歉，服务暂时不可用。' })
  } finally {
    loading.value = false
    await nextTick()
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight
    }
  }
}
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

.chat-toggle {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.2s;
}

.chat-toggle:hover {
  transform: scale(1.05);
}

.chat-window {
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: #10b981;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.model-selector {
  padding: 10px 15px;
  background: #f3f4f6;
  border-bottom: 1px solid #eee;
}

.model-selector select {
  width: 100%;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 12px;
}

.chat-body {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f9f9f9;
}

.message {
  margin-bottom: 10px;
  padding: 10px 15px;
  border-radius: 18px;
  max-width: 80%;
  font-size: 14px;
  line-height: 1.4;
}

.message.user {
  align-self: flex-end;
  background: #10b981;
  color: white;
  border-bottom-right-radius: 4px;
  margin-left: auto;
}

.message.assistant {
  align-self: flex-start;
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.chat-footer {
  padding: 15px;
  background: white;
  display: flex;
  gap: 10px;
  border-top: 1px solid #eee;
}

.chat-footer input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
}

.chat-footer input:disabled {
  background: #f3f4f6;
}

.chat-footer button {
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}

.chat-footer button:disabled {
  background: #999;
  cursor: not-allowed;
}
</style>