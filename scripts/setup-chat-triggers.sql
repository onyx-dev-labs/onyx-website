-- CHAT SYSTEM TRIGGERS
-- Run this in Supabase SQL Editor to enable real-time notifications and unread counts

-- 1. Function to handle new message logic
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation metadata
  UPDATE conversations
  SET last_message_at = NEW.created_at,
      last_message_id = NEW.id
  WHERE id = NEW.conversation_id;

  -- Increment unread_count for all participants except the sender
  UPDATE conversation_participants
  SET unread_count = COALESCE(unread_count, 0) + 1
  WHERE conversation_id = NEW.conversation_id
  AND user_id != NEW.sender_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger for new messages
DROP TRIGGER IF EXISTS on_new_message ON messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message();

-- 3. Function to reset unread count when messages are read
CREATE OR REPLACE FUNCTION public.handle_read_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If last_read_at is updated, reset unread_count to 0
  IF OLD.last_read_at IS DISTINCT FROM NEW.last_read_at THEN
     NEW.unread_count := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger for read status
DROP TRIGGER IF EXISTS on_read_status ON conversation_participants;
CREATE TRIGGER on_read_status
  BEFORE UPDATE ON conversation_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_read_status();
