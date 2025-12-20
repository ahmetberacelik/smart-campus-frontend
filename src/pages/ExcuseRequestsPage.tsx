import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { attendanceService } from '@/services/api/attendance.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import './ExcuseRequestsPage.css';

export const ExcuseRequestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');

  const { data: requestsData, isLoading } = useQuery(
    'excuse-requests',
    () => attendanceService.getExcuseRequests({
      page: 0,
      limit: 100,
    }),
    {
      retry: 1,
      onError: (_err: any) => {
        toast.error('Mazeret istekleri yüklenirken bir hata oluştu');
      },
    }
  );

  const pageData = requestsData?.data;
  const requests = pageData?.content || pageData || [];

  const approveMutation = useMutation(
    (id: string | number) => attendanceService.approveExcuseRequest(id),
    {
      onSuccess: () => {
        toast.success('Mazeret talebi onaylandı');
        setApproveModalOpen(false);
        setSelectedRequest(null);
        queryClient.invalidateQueries('excuse-requests');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Mazeret talebi onaylanırken bir hata oluştu');
      },
    }
  );

  const rejectMutation = useMutation(
    ({ id, notes }: { id: string | number; notes?: string }) =>
      attendanceService.rejectExcuseRequest(id, notes),
    {
      onSuccess: () => {
        toast.success('Mazeret talebi reddedildi');
        setRejectModalOpen(false);
        setRejectNotes('');
        setSelectedRequest(null);
        queryClient.invalidateQueries('excuse-requests');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Mazeret talebi reddedilirken bir hata oluştu');
      },
    }
  );

  const handleApprove = (request: any) => {
    setSelectedRequest(request);
    setApproveModalOpen(true);
  };

  const handleReject = (request: any) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };

  const confirmApprove = () => {
    if (selectedRequest) {
      approveMutation.mutate(selectedRequest.id);
    }
  };

  const confirmReject = () => {
    if (selectedRequest) {
      rejectMutation.mutate({ id: selectedRequest.id, notes: rejectNotes || undefined });
    }
  };

  if (isLoading) {
    return (
      <div className="excuse-requests-page">
        <LoadingSpinner />
      </div>
    );
  }

  const pendingRequests = requests.filter((req: any) => req.status === 'PENDING');
  const processedRequests = requests.filter((req: any) => req.status !== 'PENDING');

  return (
    <div className="excuse-requests-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Mazeret İstekleri' },
        ]}
      />
      <PageHeader
        title="Mazeret İstekleri"
        description="Öğrencilerden gelen mazeret taleplerini görüntüleyin ve yönetin"
      />

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="requests-section">
          <h2>Bekleyen İstekler ({pendingRequests.length})</h2>
          <div className="requests-grid">
            {pendingRequests.map((request: any) => (
              <Card key={request.id} className="request-card">
                <CardHeader>
                  <div className="request-header">
                    <div>
                      <CardTitle>{request.courseCode} - {request.courseName}</CardTitle>
                      <p className="student-info">
                        {request.studentName} ({request.studentNumber})
                      </p>
                    </div>
                    <Badge variant="warning">Beklemede</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="request-details">
                    <div className="detail-row">
                      <span className="detail-label">Tarih:</span>
                      <span className="detail-value">
                        {new Date(request.absenceDate || request.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Neden:</span>
                      <span className="detail-value">{request.reason}</span>
                    </div>
                    {request.documentUrl && (
                      <div className="detail-row">
                        <span className="detail-label">Belge:</span>
                        <a
                          href={request.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="document-link"
                        >
                          Belgeyi Görüntüle
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="request-actions">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleReject(request)}
                    >
                      Reddet
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request)}
                    >
                      Onayla
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div className="requests-section">
          <h2>İşlenmiş İstekler</h2>
          <div className="requests-grid">
            {processedRequests.map((request: any) => (
              <Card key={request.id} className="request-card">
                <CardHeader>
                  <div className="request-header">
                    <div>
                      <CardTitle>{request.courseCode} - {request.courseName}</CardTitle>
                      <p className="student-info">
                        {request.studentName} ({request.studentNumber})
                      </p>
                    </div>
                    <Badge variant={request.status === 'APPROVED' ? 'success' : 'error'}>
                      {request.status === 'APPROVED' ? 'Onaylandı' : 'Reddedildi'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="request-details">
                    <div className="detail-row">
                      <span className="detail-label">Tarih:</span>
                      <span className="detail-value">
                        {new Date(request.absenceDate || request.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Neden:</span>
                      <span className="detail-value">{request.reason}</span>
                    </div>
                    {request.notes && (
                      <div className="detail-row">
                        <span className="detail-label">Notlar:</span>
                        <span className="detail-value">{request.notes}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <Card className="empty-state-card">
          <CardContent>
            <div className="empty-state">
              <h3>Henüz mazeret talebi bulunmuyor</h3>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedRequest(null);
        }}
        title="Mazeret Talebini Onayla"
        size="md"
      >
        {selectedRequest && (
          <div className="modal-content">
            <p>Bu mazeret talebini onaylamak istediğinize emin misiniz?</p>
            <div className="modal-info">
              <p><strong>Öğrenci:</strong> {selectedRequest.studentName}</p>
              <p><strong>Ders:</strong> {selectedRequest.courseCode}</p>
              <p><strong>Neden:</strong> {selectedRequest.reason}</p>
            </div>
            <div className="modal-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setApproveModalOpen(false);
                  setSelectedRequest(null);
                }}
              >
                İptal
              </Button>
              <Button
                onClick={confirmApprove}
                disabled={approveMutation.isLoading}
              >
                {approveMutation.isLoading ? 'Onaylanıyor...' : 'Onayla'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedRequest(null);
          setRejectNotes('');
        }}
        title="Mazeret Talebini Reddet"
        size="md"
      >
        {selectedRequest && (
          <div className="modal-content">
            <p>Mazeret talebini reddetmek için bir not ekleyebilirsiniz:</p>
            <TextInput
              type="textarea"
              placeholder="Red nedeni (opsiyonel)..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={4}
            />
            <div className="modal-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setRejectModalOpen(false);
                  setSelectedRequest(null);
                  setRejectNotes('');
                }}
              >
                İptal
              </Button>
              <Button
                variant="secondary"
                onClick={confirmReject}
                disabled={rejectMutation.isLoading}
              >
                {rejectMutation.isLoading ? 'Reddediliyor...' : 'Reddet'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
