-- XRX WorkHub 초기 스키마
-- profiles 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID REFERENCES auth.users PRIMARY KEY,
  display_name    TEXT NOT NULL,
  email           TEXT NOT NULL,
  avatar_url      TEXT,
  google_tokens   JSONB,
  theme           TEXT DEFAULT 'system',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- projects 테이블
CREATE TABLE IF NOT EXISTS projects (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  color           TEXT DEFAULT '#FF9800',
  icon            TEXT DEFAULT '📁',
  drive_folder_id TEXT,
  owner_id        UUID REFERENCES profiles(id),
  is_archived     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- project_members 테이블
CREATE TABLE IF NOT EXISTS project_members (
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role        TEXT DEFAULT 'member',
  PRIMARY KEY (project_id, user_id)
);

-- todos 테이블
CREATE TABLE IF NOT EXISTS todos (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by      UUID REFERENCES profiles(id),
  assigned_to     UUID REFERENCES profiles(id),
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT DEFAULT 'pending',
  priority        TEXT DEFAULT 'medium',
  due_date        DATE,
  gcal_event_id   TEXT,
  drive_file_ids  TEXT[],
  completed_at    TIMESTAMPTZ,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_todos_project ON todos(project_id, status);
CREATE INDEX idx_todos_assigned ON todos(assigned_to, status);
CREATE INDEX idx_todos_due ON todos(due_date) WHERE status = 'pending';

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 프로필은 본인만 접근
CREATE POLICY "프로필 본인 조회" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "프로필 본인 수정" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS 정책: 프로젝트는 멤버만 접근
CREATE POLICY "프로젝트 멤버 조회" ON projects FOR SELECT
  USING (id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid()));
CREATE POLICY "프로젝트 소유자 생성" ON projects FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "프로젝트 소유자 수정" ON projects FOR UPDATE
  USING (owner_id = auth.uid());

-- RLS 정책: TODO는 프로젝트 멤버만 접근
CREATE POLICY "TODO 멤버 조회" ON todos FOR SELECT
  USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid()));
CREATE POLICY "TODO 멤버 생성" ON todos FOR INSERT
  WITH CHECK (project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid()));
CREATE POLICY "TODO 멤버 수정" ON todos FOR UPDATE
  USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid()));
CREATE POLICY "TODO 멤버 삭제" ON todos FOR DELETE
  USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid()));
