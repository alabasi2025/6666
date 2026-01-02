                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedReadings.length > 0 && selectedReadings.length === filteredReadings.filter(r => !r.isApproved).length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>رقم العداد</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>الفترة</TableHead>
                    <TableHead>القراءة السابقة</TableHead>
                    <TableHead>القراءة الحالية</TableHead>
                    <TableHead>الاستهلاك</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {readingsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">جاري التحميل...</TableCell>
                    </TableRow>
                  ) : filteredReadings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">لا توجد قراءات</TableCell>
                    </TableRow>
                  ) : (
                    filteredReadings.map((reading) => (
                      <TableRow key={(reading as any).id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedReadings.includes((reading as any).id)}
                            onCheckedChange={() => toggleSelection((reading as any).id)}
                            disabled={(reading as any).isApproved}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{(reading as any).meterNumber}</TableCell>
                        <TableCell>{(reading as any).customerName}</TableCell>
                        <TableCell>{(reading as any).billingPeriodName}</TableCell>
                        <TableCell>{parseFloat((reading as any).previousReading).toLocaleString()}</TableCell>
                        <TableCell>{parseFloat((reading as any).currentReading).toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">{parseFloat((reading as any).consumption).toLocaleString()}</TableCell>
                        <TableCell>{getReadingTypeLabel((reading as any).readingType)}</TableCell>
                        <TableCell>{new Date((reading as any).readingDate).toLocaleDateString("ar-SA")}</TableCell>
                        <TableCell>
                          {(reading as any).isApproved ? (
                            <Badge className="bg-green-100 text-green-800">معتمد</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">معلق</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedReading(reading)} title="عرض">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!(reading as any).isApproved && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => setEditingReading(reading)} title="تعديل">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteReading((reading as any).id)} className="text-red-500" title="حذف">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>إضافة قراءة جديدة</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>فترة الفوترة *</Label>
                    <Select value={(formData as any).billingPeriodId} onValueChange={(v) => setFormData({ ...formData, billingPeriodId: v })}>
                      <SelectTrigger><SelectValue placeholder="اختر الفترة" /></SelectTrigger>
                      <SelectContent>
                        {activePeriods.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>العداد *</Label>
                    <Select value={(formData as any).meterId} onValueChange={(v) => setFormData({ ...formData, meterId: v })}>
                      <SelectTrigger><SelectValue placeholder="اختر العداد" /></SelectTrigger>
                      <SelectContent>
                        {metersQuery.data?.map(m => (
                          <SelectItem key={m.id} value={m.id.toString()}>{m.meterNumber} - {m.customerName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>القراءة الحالية *</Label>
                    <Input type="number" value={(formData as any).currentReading} onChange={(e) => setFormData({ ...formData, currentReading: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ القراءة *</Label>
                    <Input type="date" value={(formData as any).readingDate} onChange={(e) => setFormData({ ...formData, readingDate: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع القراءة</Label>
                    <Select value={(formData as any).readingType} onValueChange={(v) => setFormData({ ...formData, readingType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">يدوي</SelectItem>
                        <SelectItem value="automatic">تلقائي</SelectItem>
                        <SelectItem value="estimated">تقديري</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label>ملاحظات</Label>
                    <Textarea value={(formData as any).notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { resetForm(); setActiveTab("list"); }}>إلغاء</Button>
                  <Button type="submit" disabled={loading}>{loading ? "جاري الحفظ..." : "حفظ"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog الإدخال الجماعي */}
      <Dialog open={showBulkEntryDialog} onOpenChange={setShowBulkEntryDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>إدخال قراءات جماعي</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>فترة الفوترة</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="اختر الفترة" /></SelectTrigger>
                  <SelectContent>
                    {activePeriods.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تاريخ القراءة</Label>
                <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم العداد</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>القراءة السابقة</TableHead>
                    <TableHead>القراءة الحالية</TableHead>
                    <TableHead>الاستهلاك</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metersQuery.data?.slice(0, 5).map(meter => (
                    <TableRow key={(meter as any).id}>
                      <TableCell>{(meter as any).meterNumber}</TableCell>
                      <TableCell>{(meter as any).customerName}</TableCell>
                      <TableCell>{(meter as any).lastReading || 0}</TableCell>
                      <TableCell>
                        <Input type="number" className="w-32" placeholder="القراءة" />
                      </TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBulkEntryDialog(false)}>إلغاء</Button>
              <Button>حفظ الكل</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Reading Dialog */}
      <Dialog open={!!selectedReading} onOpenChange={() => setSelectedReading(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              تفاصيل القراءة
            </DialogTitle>
          </DialogHeader>
          {selectedReading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">رقم العداد</Label>
                  <p className="font-medium font-mono">{selectedReading.meterNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">العميل</Label>
                  <p className="font-medium">{selectedReading.customerName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الفترة</Label>
                  <p className="font-medium">{selectedReading.billingPeriodName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">تاريخ القراءة</Label>
                  <p className="font-medium">{new Date(selectedReading.readingDate).toLocaleDateString("ar-SA")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">القراءة السابقة</Label>
                  <p className="font-medium">{parseFloat(selectedReading.previousReading).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">القراءة الحالية</Label>
                  <p className="font-medium">{parseFloat(selectedReading.currentReading).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الاستهلاك</Label>
                  <p className="font-medium text-lg">{parseFloat(selectedReading.consumption).toLocaleString()} ك.و.س</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">نوع القراءة</Label>
                  <p className="font-medium">{getReadingTypeLabel(selectedReading.readingType)}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">الحالة</Label>
                  <div className="mt-1">
                    {selectedReading.isApproved ? (
                      <Badge className="bg-green-100 text-green-800">معتمد</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">معلق</Badge>
                    )}
                  </div>
                </div>
                {selectedReading.notes && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">ملاحظات</Label>
                    <p className="font-medium">{selectedReading.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedReading(null)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
