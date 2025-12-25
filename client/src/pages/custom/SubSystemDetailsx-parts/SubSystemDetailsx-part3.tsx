                  )}

                  {newTreasury.treasuryType === "wallet" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>مزود المحفظة</Label>
                        <Input
                          value={newTreasury.walletProvider}
                          onChange={(e) => setNewTreasury({ ...newTreasury, walletProvider: e.target.value })}
                          placeholder="STC Pay"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>رقم المحفظة</Label>
                        <Input
                          value={newTreasury.walletNumber}
                          onChange={(e) => setNewTreasury({ ...newTreasury, walletNumber: e.target.value })}
                          placeholder="05xxxxxxxx"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>العملة</Label>
                      <Select
                        value={newTreasury.currency}
                        onValueChange={(v) => setNewTreasury({ ...newTreasury, currency: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAR">ريال سعودي</SelectItem>
                          <SelectItem value="USD">دولار أمريكي</SelectItem>
                          <SelectItem value="EUR">يورو</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>الرصيد الافتتاحي</Label>
                      <Input
                        type="number"
                        value={newTreasury.openingBalance}
                        onChange={(e) => setNewTreasury({ ...newTreasury, openingBalance: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>الوصف</Label>
                    <Textarea
                      value={newTreasury.description}
                      onChange={(e) => setNewTreasury({ ...newTreasury, description: e.target.value })}
                      placeholder="وصف الخزينة..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddTreasuryOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleCreateTreasury} disabled={createTreasuryMutation.isPending}>
                    {createTreasuryMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    إنشاء
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {treasuriesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : treasuries && treasuries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {treasuries.map((treasury: any) => (
                <TreasuryCard
                  key={treasury.id}
                  treasury={treasury}
                  onEdit={() => {}}
                  onDelete={handleDeleteTreasury}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wallet className="h-12 w-12 text-slate-600 mb-4" />
                <p className="text-slate-400 text-lg mb-2">لا توجد خزائن</p>
                <p className="text-slate-500 text-sm mb-4">أضف خزينة جديدة للبدء</p>
                <Button onClick={() => setIsAddTreasuryOpen(true)}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة خزينة
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Vouchers Tab */}
        <TabsContent value="vouchers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">السندات</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                onClick={() => {
                  setVoucherType("receipt");
                  setIsAddVoucherOpen(true);
                }}
              >
                <Plus className="ml-2 h-4 w-4" />
                سند قبض
              </Button>
              <Button
                variant="outline"
                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                onClick={() => {
                  setVoucherType("payment");
                  setIsAddVoucherOpen(true);
                }}
              >
                <Plus className="ml-2 h-4 w-4" />
                سند صرف
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Receipt Vouchers */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-green-500 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  سندات القبض
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {receiptVouchers?.map((voucher: any) => (
                  <VoucherRow key={voucher.id} voucher={voucher} type="receipt" onView={() => {}} />
                ))}
                {(!receiptVouchers || receiptVouchers.length === 0) && (
                  <p className="text-center text-slate-400 py-4">لا توجد سندات قبض</p>
                )}
              </CardContent>
            </Card>

            {/* Payment Vouchers */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-red-500 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  سندات الصرف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {paymentVouchers?.map((voucher: any) => (
                  <VoucherRow key={voucher.id} voucher={voucher} type="payment" onView={() => {}} />
                ))}
                {(!paymentVouchers || paymentVouchers.length === 0) && (
                  <p className="text-center text-slate-400 py-4">لا توجد سندات صرف</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add Voucher Dialog */}
          <Dialog open={isAddVoucherOpen} onOpenChange={setIsAddVoucherOpen}>
            <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {voucherType === "receipt" ? "إنشاء سند قبض" : "إنشاء سند صرف"}
                </DialogTitle>
                <DialogDescription>
                  {voucherType === "receipt" 
                    ? "سند قبض لاستلام مبلغ في الخزينة" 
                    : "سند صرف لصرف مبلغ من الخزينة"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>المبلغ</Label>
                    <Input
                      type="number"
                      value={newVoucher.amount}
                      onChange={(e) => setNewVoucher({ ...newVoucher, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الخزينة</Label>
                    <Select
                      value={newVoucher.treasuryId.toString()}
                      onValueChange={(v) => setNewVoucher({ ...newVoucher, treasuryId: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الخزينة" />
                      </SelectTrigger>
                      <SelectContent>
                        {treasuries?.map((t: any) => (
                          <SelectItem key={t.id} value={t.id.toString()}>
                            {t.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {voucherType === "receipt" ? (
                  <>
                    <div className="space-y-2">
                      <Label>نوع المصدر</Label>
                      <Select
                        value={newVoucher.sourceType}
                        onValueChange={(v: any) => setNewVoucher({ ...newVoucher, sourceType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="person">شخص</SelectItem>
                          <SelectItem value="entity">جهة</SelectItem>
                          <SelectItem value="intermediary">حساب وسيط</SelectItem>
                          <SelectItem value="other">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newVoucher.sourceType === "intermediary" ? (
                      <div className="space-y-2">
                        <Label>الحساب الوسيط</Label>
                        <Select
                          value={newVoucher.sourceIntermediaryId?.toString() || ""}
                          onValueChange={(v) => setNewVoucher({ ...newVoucher, sourceIntermediaryId: parseInt(v) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الحساب الوسيط" />
                          </SelectTrigger>
                          <SelectContent>
                            {relatedIntermediaryAccounts.map((acc: any) => (
                              <SelectItem key={acc.id} value={acc.id.toString()}>
                                {acc.nameAr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>اسم المصدر</Label>
                        <Input
                          value={newVoucher.sourceName}
                          onChange={(e) => setNewVoucher({ ...newVoucher, sourceName: e.target.value })}
                          placeholder="اسم الشخص أو الجهة"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>نوع الوجهة</Label>
                      <Select
                        value={newVoucher.destinationType}
                        onValueChange={(v: any) => setNewVoucher({ ...newVoucher, destinationType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="person">شخص</SelectItem>
                          <SelectItem value="entity">جهة</SelectItem>
                          <SelectItem value="intermediary">حساب وسيط</SelectItem>
                          <SelectItem value="other">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newVoucher.destinationType === "intermediary" ? (
                      <div className="space-y-2">
                        <Label>الحساب الوسيط</Label>
                        <Select
                          value={newVoucher.destinationIntermediaryId?.toString() || ""}
                          onValueChange={(v) => setNewVoucher({ ...newVoucher, destinationIntermediaryId: parseInt(v) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الحساب الوسيط" />
                          </SelectTrigger>
                          <SelectContent>
                            {relatedIntermediaryAccounts.map((acc: any) => (
                              <SelectItem key={acc.id} value={acc.id.toString()}>
                                {acc.nameAr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>اسم الوجهة</Label>
                        <Input
                          value={newVoucher.destinationName}
                          onChange={(e) => setNewVoucher({ ...newVoucher, destinationName: e.target.value })}
                          placeholder="اسم الشخص أو الجهة"
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Textarea
                    value={newVoucher.description}
                    onChange={(e) => setNewVoucher({ ...newVoucher, description: e.target.value })}
                    placeholder="وصف السند..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddVoucherOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={handleCreateVoucher} 
                  disabled={createReceiptMutation.isPending || createPaymentMutation.isPending}
                  className={voucherType === "receipt" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                >
                  {(createReceiptMutation.isPending || createPaymentMutation.isPending) && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  إنشاء
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers" className="space-y-4">
          {/* Transfer Actions */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">التحويلات بين الأنظمة</h3>
              <p className="text-sm text-slate-400">إدارة التحويلات المالية بين هذا النظام والأنظمة الفرعية الأخرى</p>
            </div>
            <Dialog open={isAddTransferOpen} onOpenChange={setIsAddTransferOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <Send className="h-4 w-4 ml-2" />
                  تحويل جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">تحويل مالي جديد</DialogTitle>
                  <DialogDescription>تحويل مبلغ من هذا النظام إلى نظام فرعي آخر</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Target Sub System */}
                  <div className="space-y-2">
                    <Label>النظام المستهدف *</Label>
                    <Select
                      value={newTransfer.toSubSystemId.toString()}
                      onValueChange={(v) => setNewTransfer({ ...newTransfer, toSubSystemId: parseInt(v), toTreasuryId: 0 })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue placeholder="اختر النظام المستهدف" />
                      </SelectTrigger>
                      <SelectContent>
                        {allSubSystems?.filter(s => s.id !== parseInt(id || "0")).map((sys) => (
                          <SelectItem key={sys.id} value={sys.id.toString()}>
                            {sys.nameAr} ({sys.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Source Treasury */}
                  <div className="space-y-2">
                    <Label>الخزينة المصدر (من هذا النظام) *</Label>
                    <Select
                      value={newTransfer.fromTreasuryId.toString()}
                      onValueChange={(v) => setNewTransfer({ ...newTransfer, fromTreasuryId: parseInt(v) })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue placeholder="اختر الخزينة المصدر" />
                      </SelectTrigger>
                      <SelectContent>
                        {treasuries?.map((t) => (
                          <SelectItem key={t.id} value={t.id.toString()}>
                            {t.nameAr} - رصيد: {parseFloat(t.currentBalance || "0").toLocaleString("ar-SA")} {t.currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target Treasury */}
                  <div className="space-y-2">
                    <Label>الخزينة المستهدفة *</Label>
                    <Select
                      value={newTransfer.toTreasuryId.toString()}
                      onValueChange={(v) => setNewTransfer({ ...newTransfer, toTreasuryId: parseInt(v) })}
                      disabled={!newTransfer.toSubSystemId}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue placeholder={newTransfer.toSubSystemId ? "اختر الخزينة المستهدفة" : "اختر النظام أولاً"} />
                      </SelectTrigger>
                      <SelectContent>
                        {targetTreasuries?.map((t) => (
                          <SelectItem key={t.id} value={t.id.toString()}>
                            {t.nameAr} - رصيد: {parseFloat(t.currentBalance || "0").toLocaleString("ar-SA")} {t.currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

