import { IdeWorkspace } from '@/components/ide/IdeWorkspace'

export default function SessionPage({ params }: { params: { id: string } }) {
  return <IdeWorkspace sessionId={params.id} />
}
