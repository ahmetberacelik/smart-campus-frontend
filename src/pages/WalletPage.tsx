import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { walletService, type PaymentFormData } from '@/services/api/wallet.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { Modal } from '@/components/ui/Modal';
import './WalletPage.css';

export const WalletPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [page, setPage] = useState(0);

  const { data: balanceData, isLoading: balanceLoading } = useQuery(
    'wallet-balance',
    () => walletService.getBalance(),
    {
      retry: 1,
      onError: (_err: any) => {
        toast.error('Bakiye yüklenirken bir hata oluştu');
      },
    }
  );

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery(
    ['wallet-transactions', page],
    () => walletService.getTransactions({ page, limit: 20 }),
    {
      retry: 1,
      onError: (_err: any) => {
        toast.error('İşlem geçmişi yüklenirken bir hata oluştu');
      },
    }
  );

  const topupMutation = useMutation(
    (data: PaymentFormData) => walletService.topup({
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      redirectUrl: window.location.origin + '/wallet',
    }),
    {
      onSuccess: (response) => {
        if (response.data?.paymentUrl) {
          // Payment gateway'e yönlendir
          window.location.href = response.data.paymentUrl;
        } else {
          toast.success('Para yükleme işlemi başlatıldı');
          setPaymentModalOpen(false);
          queryClient.invalidateQueries('wallet-balance');
          queryClient.invalidateQueries('wallet-transactions');
        }
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Para yüklenirken bir hata oluştu');
      },
    }
  );

  const balance = balanceData?.data?.balance || 0;
  const pageData = transactionsData?.data;
  const transactions = pageData?.content || pageData || [];
  const totalPages = pageData?.totalPages || 0;

  const handlePaymentSubmit = (data: PaymentFormData) => {
    topupMutation.mutate(data);
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Para Yükleme';
      case 'WITHDRAWAL':
        return 'Para Çekme';
      case 'PAYMENT':
        return 'Ödeme';
      case 'REFUND':
        return 'İade';
      default:
        return type;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'REFUND':
        return 'success';
      case 'PAYMENT':
      case 'WITHDRAWAL':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Tamamlandı</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Beklemede</Badge>;
      case 'FAILED':
        return <Badge variant="error">Başarısız</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (balanceLoading) {
    return (
      <div className="wallet-page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Cüzdan' },
        ]}
      />
      <PageHeader
        title="Cüzdan"
        description="Bakiyenizi görüntüleyin ve para yükleyin"
        actions={
          <Button onClick={() => setPaymentModalOpen(true)}>
            💰 Para Yükle
          </Button>
        }
      />

      {/* Balance Card */}
      <Card className="balance-card">
        <CardContent>
          <div className="balance-display">
            <div className="balance-label">Mevcut Bakiye</div>
            <div className="balance-amount">{balance.toFixed(2)}₺</div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>İşlem Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <LoadingSpinner />
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <p>Henüz işlem geçmişi bulunmuyor</p>
            </div>
          ) : (
            <>
              <div className="transactions-table-container">
                <Table>
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>İşlem Türü</th>
                      <th>Açıklama</th>
                      <th>Tutar</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction: any) => (
                      <tr key={transaction.id}>
                        <td>
                          {format(parseISO(transaction.createdAt), 'd MMM yyyy HH:mm', { locale: tr })}
                        </td>
                        <td>
                          <Badge variant={getTransactionTypeColor(transaction.type) as any}>
                            {getTransactionTypeLabel(transaction.type)}
                          </Badge>
                        </td>
                        <td>{transaction.description || '-'}</td>
                        <td className={`transaction-amount ${transaction.type === 'DEPOSIT' || transaction.type === 'REFUND' ? 'positive' : 'negative'}`}>
                          {transaction.type === 'DEPOSIT' || transaction.type === 'REFUND' ? '+' : '-'}
                          {Math.abs(transaction.amount).toFixed(2)}₺
                        </td>
                        <td>{getStatusBadge(transaction.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <Button
                    variant="secondary"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    Önceki
                  </Button>
                  <span>
                    Sayfa {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    Sonraki
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Para Yükle"
        size="lg"
      >
        <PaymentForm
          onSubmit={handlePaymentSubmit}
          onCancel={() => setPaymentModalOpen(false)}
          loading={topupMutation.isLoading}
          minAmount={10}
          maxAmount={10000}
        />
      </Modal>
    </div>
  );
};

