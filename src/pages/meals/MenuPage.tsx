import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { mealService } from '@/services/api/meal.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import './MenuPage.css';

export const MenuPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);

  const { data: menusData, isLoading } = useQuery(
    ['menus', selectedDate],
    () => mealService.getMenus({ date: selectedDate }),
    {
      retry: 1,
      onError: (err: any) => {
        toast.error('Menüler yüklenirken bir hata oluştu');
      },
    }
  );

  const menus = menusData?.data || [];
  const lunchMenu = menus.find((m: any) => m.mealType === 'LUNCH');
  const dinnerMenu = menus.find((m: any) => m.mealType === 'DINNER');

  const createReservationMutation = useMutation(
    (menuId: string) => mealService.createReservation({ menuId }),
    {
      onSuccess: () => {
        toast.success('Yemek rezervasyonu başarıyla oluşturuldu');
        setReservationModalOpen(false);
        setSelectedMenu(null);
        queryClient.invalidateQueries('my-reservations');
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Rezervasyon oluşturulurken bir hata oluştu');
      },
    }
  );

  const handleReserve = (menu: any) => {
    setSelectedMenu(menu);
    setReservationModalOpen(true);
  };

  const handleConfirmReservation = () => {
    if (selectedMenu) {
      createReservationMutation.mutate(selectedMenu.id);
    }
  };

  const isStudent = user?.role?.toLowerCase() === 'student' || user?.role === 'STUDENT';

  if (isLoading) {
    return (
      <div className="menu-page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="menu-page">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', to: '/dashboard' },
          { label: 'Yemek Menüsü' },
        ]}
      />
      <PageHeader
        title="Yemek Menüsü"
        description="Günlük öğle ve akşam yemeği menülerini görüntüleyin ve rezervasyon yapın"
      />

      <div className="menu-filters">
        <label>Tarih Seçin:</label>
        <TextInput
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={format(new Date(), 'yyyy-MM-dd')}
        />
      </div>

      <div className="menus-container">
        {/* Lunch Menu */}
        <Card className="menu-card">
          <CardHeader>
            <CardTitle>🍽️ Öğle Yemeği (Lunch)</CardTitle>
          </CardHeader>
          <CardContent>
            {lunchMenu ? (
              <>
                {lunchMenu.items && lunchMenu.items.length > 0 ? (
                  <div className="menu-items">
                    {lunchMenu.items.map((item: any) => (
                      <div key={item.id} className="menu-item">
                        <div className="menu-item-header">
                          <h4>{item.name}</h4>
                          <div className="menu-item-badges">
                            {item.isVegan && <Badge variant="success">🌱 Vegan</Badge>}
                            {item.isVegetarian && !item.isVegan && <Badge variant="warning">🥗 Vejetaryen</Badge>}
                          </div>
                        </div>
                        {item.description && (
                          <p className="menu-item-description">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-menu">Bu tarih için öğle yemeği menüsü bulunamadı</p>
                )}

                {lunchMenu.nutritionalInfo && (
                  <div className="nutritional-info">
                    <h4>Beslenme Bilgileri:</h4>
                    <div className="nutrition-grid">
                      <div className="nutrition-item">
                        <span className="nutrition-label">Kalori:</span>
                        <span className="nutrition-value">{lunchMenu.nutritionalInfo.calories} kcal</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Protein:</span>
                        <span className="nutrition-value">{lunchMenu.nutritionalInfo.protein}g</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Karbonhidrat:</span>
                        <span className="nutrition-value">{lunchMenu.nutritionalInfo.carbs}g</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Yağ:</span>
                        <span className="nutrition-value">{lunchMenu.nutritionalInfo.fat}g</span>
                      </div>
                    </div>
                  </div>
                )}

                {isStudent && (
                  <Button
                    onClick={() => handleReserve(lunchMenu)}
                    disabled={createReservationMutation.isLoading}
                    fullWidth
                    style={{ marginTop: '16px' }}
                  >
                    {createReservationMutation.isLoading ? 'Rezerve Ediliyor...' : 'Rezerve Et'}
                  </Button>
                )}
              </>
            ) : (
              <p className="no-menu">Bu tarih için öğle yemeği menüsü bulunamadı</p>
            )}
          </CardContent>
        </Card>

        {/* Dinner Menu */}
        <Card className="menu-card">
          <CardHeader>
            <CardTitle>🍽️ Akşam Yemeği (Dinner)</CardTitle>
          </CardHeader>
          <CardContent>
            {dinnerMenu ? (
              <>
                {dinnerMenu.items && dinnerMenu.items.length > 0 ? (
                  <div className="menu-items">
                    {dinnerMenu.items.map((item: any) => (
                      <div key={item.id} className="menu-item">
                        <div className="menu-item-header">
                          <h4>{item.name}</h4>
                          <div className="menu-item-badges">
                            {item.isVegan && <Badge variant="success">🌱 Vegan</Badge>}
                            {item.isVegetarian && !item.isVegan && <Badge variant="warning">🥗 Vejetaryen</Badge>}
                          </div>
                        </div>
                        {item.description && (
                          <p className="menu-item-description">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-menu">Bu tarih için akşam yemeği menüsü bulunamadı</p>
                )}

                {dinnerMenu.nutritionalInfo && (
                  <div className="nutritional-info">
                    <h4>Beslenme Bilgileri:</h4>
                    <div className="nutrition-grid">
                      <div className="nutrition-item">
                        <span className="nutrition-label">Kalori:</span>
                        <span className="nutrition-value">{dinnerMenu.nutritionalInfo.calories} kcal</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Protein:</span>
                        <span className="nutrition-value">{dinnerMenu.nutritionalInfo.protein}g</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Karbonhidrat:</span>
                        <span className="nutrition-value">{dinnerMenu.nutritionalInfo.carbs}g</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Yağ:</span>
                        <span className="nutrition-value">{dinnerMenu.nutritionalInfo.fat}g</span>
                      </div>
                    </div>
                  </div>
                )}

                {isStudent && (
                  <Button
                    onClick={() => handleReserve(dinnerMenu)}
                    disabled={createReservationMutation.isLoading}
                    fullWidth
                    style={{ marginTop: '16px' }}
                  >
                    {createReservationMutation.isLoading ? 'Rezerve Ediliyor...' : 'Rezerve Et'}
                  </Button>
                )}
              </>
            ) : (
              <p className="no-menu">Bu tarih için akşam yemeği menüsü bulunamadı</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reservation Confirmation Modal */}
      <Modal
        isOpen={reservationModalOpen}
        onClose={() => {
          setReservationModalOpen(false);
          setSelectedMenu(null);
        }}
        title="Yemek Rezervasyonu"
        size="md"
      >
        {selectedMenu && (
          <div className="reservation-modal-content">
            <div className="reservation-info">
              <p><strong>Tarih:</strong> {format(parseISO(selectedDate), 'd MMMM yyyy EEEE', { locale: tr })}</p>
              <p><strong>Öğün:</strong> {selectedMenu.mealType === 'LUNCH' ? 'Öğle Yemeği' : 'Akşam Yemeği'}</p>
            </div>
            <div className="reservation-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setReservationModalOpen(false);
                  setSelectedMenu(null);
                }}
              >
                İptal
              </Button>
              <Button
                onClick={handleConfirmReservation}
                disabled={createReservationMutation.isLoading}
              >
                {createReservationMutation.isLoading ? 'Rezerve Ediliyor...' : 'Onayla'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

