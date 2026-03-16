-- 신규 사용자 가입 시 profiles 테이블 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 설정
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- chat 테이블 생성
CREATE TABLE IF NOT EXISTS chat_channels (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  is_direct   BOOLEAN DEFAULT false,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id  UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id),
  content     TEXT NOT NULL,
  thread_id   UUID REFERENCES chat_messages(id),
  is_edited   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- chat Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- RLS
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 임시 RLS 정책 (인증된 사용자 모두 접근)
CREATE POLICY "인증 사용자 채널 조회" ON chat_channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "인증 사용자 채널 생성" ON chat_channels FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "인증 사용자 메시지 조회" ON chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "인증 사용자 메시지 생성" ON chat_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "인증 사용자 메시지 수정" ON chat_messages FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- 기존 테이블에 임시 RLS 정책 추가 (기존 정책 제거 후 재생성 - 인증된 사용자 모두 접근)
DROP POLICY IF EXISTS "프로필 본인 조회" ON profiles;
DROP POLICY IF EXISTS "프로필 본인 수정" ON profiles;
DROP POLICY IF EXISTS "프로필 생성 허용" ON profiles;
DROP POLICY IF EXISTS "프로젝트 멤버 조회" ON projects;
DROP POLICY IF EXISTS "프로젝트 소유자 생성" ON projects;
DROP POLICY IF EXISTS "프로젝트 소유자 수정" ON projects;
DROP POLICY IF EXISTS "멤버 조회" ON project_members;
DROP POLICY IF EXISTS "멤버 추가" ON project_members;
DROP POLICY IF EXISTS "TODO 멤버 조회" ON todos;
DROP POLICY IF EXISTS "TODO 멤버 생성" ON todos;
DROP POLICY IF EXISTS "TODO 멤버 수정" ON todos;
DROP POLICY IF EXISTS "TODO 멤버 삭제" ON todos;

CREATE POLICY "인증 사용자 프로필 전체" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "인증 사용자 프로젝트 전체" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "인증 사용자 멤버 전체" ON project_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "인증 사용자 TODO 전체" ON todos FOR ALL TO authenticated USING (true) WITH CHECK (true);
