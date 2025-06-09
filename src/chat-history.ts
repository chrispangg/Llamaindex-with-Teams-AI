import { ChatMemoryBuffer } from "@llamaindex/core/memory";

const conversationStore = new Map<string, ChatMemoryBuffer>();

export const getOrCreateConversationHistory = (conversationId: string) => {
    // Check if conversation history exists
    const existingMemory = conversationStore.get(conversationId);
    if (existingMemory) {
        return existingMemory;
    }
    // If not, create a new conversation history
    const newMemory = new ChatMemoryBuffer();
    conversationStore.set(conversationId, newMemory);
    return newMemory;
};