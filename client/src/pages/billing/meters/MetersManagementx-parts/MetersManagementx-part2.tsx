            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم العداد</TableHead>
                    <TableHead>الرقم التسلسلي</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الخدمة</TableHead>
                    <TableHead>الكابينة</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>آخر قراءة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metersQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">جاري التحميل...</TableCell>
                    </TableRow>
                  ) : filteredMeters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">لا توجد عدادات</TableCell>
                    </TableRow>
                  ) : (
                    filteredMeters.map((meter) => {
                      const status = getStatusLabel(meter.status);
                      return (
                        <TableRow key={meter.id}>
                          <TableCell className="font-medium">{meter.meterNumber}</TableCell>
                          <TableCell>{meter.serialNumber || "-"}</TableCell>
                          <TableCell>{getMeterTypeLabel(meter.meterType)}</TableCell>
                          <TableCell>{getServiceTypeLabel(meter.serviceType)}</TableCell>
                          <TableCell>{meter.cabinet?.name || "-"}</TableCell>
                          <TableCell>
                            {meter.customer ? (
                              <div>
                                <div className="font-medium">{meter.customer.fullName}</div>
                                <div className="text-xs text-muted-foreground">{meter.customer.accountNumber}</div>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-orange-600">غير مربوط</Badge>
                            )}
                          </TableCell>
                          <TableCell>{meter.lastReadingValue || "0"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                              {status.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(meter)} title="تعديل">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {!meter.customerId && (
                                <Button variant="ghost" size="icon" onClick={() => { setSelectedMeter(meter); setShowLinkDialog(true); }} title="ربط بعميل">
                                  <UserPlus className="h-4 w-4 text-blue-500" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedMeter(meter); setShowQRDialog(true); }} title="QR Code">
                                <QrCode className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(meter.id)} className="text-red-500" title="حذف">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>{editingMeter ? "تعديل عداد" : "إضافة عداد جديد"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>رقم العداد *</Label>
                    <Input value={formData.meterNumber} onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })} required placeholder="MTR-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>الرقم التسلسلي</Label>
                    <Input value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع العداد</Label>
                    <Select value={formData.meterType} onValueChange={(v) => setFormData({ ...formData, meterType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_phase">أحادي الطور</SelectItem>
                        <SelectItem value="three_phase">ثلاثي الطور</SelectItem>
                        <SelectItem value="prepaid">مسبق الدفع</SelectItem>
                        <SelectItem value="smart">ذكي</SelectItem>
                        <SelectItem value="mechanical">ميكانيكي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>نوع الخدمة</Label>
                    <Select value={formData.serviceType} onValueChange={(v) => setFormData({ ...formData, serviceType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electricity">كهرباء</SelectItem>
                        <SelectItem value="water">ماء</SelectItem>
                        <SelectItem value="gas">غاز</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الحالة</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">جديد</SelectItem>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                        <SelectItem value="suspended">موقوف</SelectItem>
                        <SelectItem value="disconnected">مفصول</SelectItem>
                        <SelectItem value="faulty">معطل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الكابينة</Label>
                    <Select value={formData.cabinetId} onValueChange={(v) => setFormData({ ...formData, cabinetId: v })}>
                      <SelectTrigger><SelectValue placeholder="اختر الكابينة" /></SelectTrigger>
                      <SelectContent>
                        {cabinetsQuery.data?.map((cab: any) => (
                          <SelectItem key={cab.id} value={cab.id.toString()}>{cab.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>التعرفة</Label>
                    <Select value={formData.tariffId} onValueChange={(v) => setFormData({ ...formData, tariffId: v })}>
                      <SelectTrigger><SelectValue placeholder="اختر التعرفة" /></SelectTrigger>
                      <SelectContent>
                        {tariffsQuery.data?.map((t: any) => (
                          <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>معامل الضرب</Label>
                    <Input type="number" step="0.01" value={formData.multiplier} onChange={(e) => setFormData({ ...formData, multiplier: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>عدد الخانات</Label>
                    <Input type="number" value={formData.digits} onChange={(e) => setFormData({ ...formData, digits: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ التركيب</Label>
                    <Input type="date" value={formData.installationDate} onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { resetForm(); setActiveTab("list"); }}>إلغاء</Button>
                  <Button type="submit" disabled={loading}>{loading ? "جاري الحفظ..." : editingMeter ? "تحديث" : "حفظ"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unlinked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>العدادات غير المربوطة بعملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم العداد</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الكابينة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meters.filter(m => !m.customerId).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">جميع العدادات مربوطة بعملاء</TableCell>
                    </TableRow>
                  ) : (
                    meters.filter(m => !m.customerId).map((meter) => {
                      const status = getStatusLabel(meter.status);
                      return (
                        <TableRow key={meter.id}>
                          <TableCell className="font-medium">{meter.meterNumber}</TableCell>
                          <TableCell>{getMeterTypeLabel(meter.meterType)}</TableCell>
                          <TableCell>{meter.cabinet?.name || "-"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>{status.label}</span>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => { setSelectedMeter(meter); setShowLinkDialog(true); }}>
                              <UserPlus className="h-4 w-4 ml-2" />
                              ربط بعميل
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog ربط العداد بعميل */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ربط العداد بعميل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">العداد: <strong>{selectedMeter?.meterNumber}</strong></p>
            </div>
            <div className="space-y-2">
              <Label>العميل *</Label>
              <Select value={linkData.customerId} onValueChange={(v) => setLinkData({ ...linkData, customerId: v })}>
                <SelectTrigger><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                <SelectContent>
                  {customersQuery.data?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.fullName} - {c.accountNumber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>تاريخ التركيب</Label>
              <Input type="date" value={linkData.installationDate} onChange={(e) => setLinkData({ ...linkData, installationDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>القراءة الافتتاحية</Label>
              <Input type="number" value={linkData.initialReading} onChange={(e) => setLinkData({ ...linkData, initialReading: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>إلغاء</Button>
              <Button onClick={handleLinkCustomer} disabled={loading || !linkData.customerId}>
                {loading ? "جاري الربط..." : "ربط"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog QR Code */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code للعداد</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-48 h-48 bg-muted flex items-center justify-center rounded-lg">
              <QrCode className="h-32 w-32 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold">{selectedMeter?.meterNumber}</p>
            <Button variant="outline">طباعة QR Code</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
