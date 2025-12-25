                  {/* Amount */}
                  <div className="space-y-2">
                    <Label>المبلغ *</Label>
                    <Input
                      type="number"
                      value={newTransfer.amount}
                      onChange={(e) => setNewTransfer({ ...newTransfer, amount: e.target.value })}
                      placeholder="0.00"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label>الوصف</Label>
                    <Textarea
                      value={newTransfer.description}
                      onChange={(e) => setNewTransfer({ ...newTransfer, description: e.target.value })}
                      placeholder="وصف التحويل..."
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-400 text-sm">
                      <strong>ملاحظة:</strong> سيتم إنشاء سند صرف في هذا النظام وسند قبض في النظام المستهدف عبر حساب وسيط.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddTransferOpen(false)}>
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleCreateTransfer}
                    disabled={createTransferMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    {createTransferMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 ml-2 animate-spin" /> جاري التحويل...</>
                    ) : (
                      <><Send className="h-4 w-4 ml-2" /> تنفيذ التحويل</>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Outgoing Transfers */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                التحويلات الصادرة
              </CardTitle>
              <CardDescription>المبالغ المحولة من هذا النظام إلى أنظمة أخرى</CardDescription>
            </CardHeader>
            <CardContent>
              {(transfers as any)?.outgoing && (transfers as any).outgoing.length > 0 ? (
                <div className="space-y-3">
                  {((transfers as any).outgoing || []).map((transfer: any) => (
                    <div key={transfer.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{transfer.voucherNumber}</p>
                          <p className="text-sm text-slate-400">{transfer.description || 'تحويل بين الأنظمة'}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-red-400 font-bold">-{parseFloat(transfer.amount).toLocaleString("ar-SA")} {transfer.currency}</p>
                        <p className="text-xs text-slate-500">{new Date(transfer.voucherDate).toLocaleDateString("ar-SA")}</p>
                      </div>
                      <Badge variant="outline" className={cn(
                        transfer.isReconciled 
                          ? "bg-green-500/20 text-green-500 border-green-500/30" 
                          : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                      )}>
                        {transfer.isReconciled ? "مطابق" : "بانتظار المطابقة"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <TrendingDown className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">لا توجد تحويلات صادرة</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Incoming Transfers */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                التحويلات الواردة
              </CardTitle>
              <CardDescription>المبالغ المحولة إلى هذا النظام من أنظمة أخرى</CardDescription>
            </CardHeader>
            <CardContent>
              {(transfers as any)?.incoming && (transfers as any).incoming.length > 0 ? (
                <div className="space-y-3">
                  {((transfers as any).incoming || []).map((transfer: any) => (
                    <div key={transfer.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{transfer.voucherNumber}</p>
                          <p className="text-sm text-slate-400">{transfer.description || 'تحويل بين الأنظمة'}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-green-400 font-bold">+{parseFloat(transfer.amount).toLocaleString("ar-SA")} {transfer.currency}</p>
                        <p className="text-xs text-slate-500">{new Date(transfer.voucherDate).toLocaleDateString("ar-SA")}</p>
                      </div>
                      <Badge variant="outline" className={cn(
                        transfer.isReconciled 
                          ? "bg-green-500/20 text-green-500 border-green-500/30" 
                          : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                      )}>
                        {transfer.isReconciled ? "مطابق" : "بانتظار المطابقة"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <TrendingUp className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">لا توجد تحويلات واردة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reconciliation Tab */}
        <TabsContent value="reconciliation" className="space-y-4">
          {/* بطاقة المطابقة التلقائية */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/50 border-purple-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">المطابقة التلقائية</CardTitle>
                    <CardDescription>البحث عن سندات قبض وصرف متطابقة تلقائياً</CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => autoReconcileMutation.mutate({ businessId: 1 } as any)}
                  disabled={autoReconcileMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {autoReconcileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 ml-2" />
                  )}
                  بحث عن مطابقات
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {reconciliations?.filter(r => r.status === "pending").length || 0}
                  </p>
                  <p className="text-sm text-slate-400">بانتظار التأكيد</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {reconciliations?.filter(r => r.status === "confirmed").length || 0}
                  </p>
                  <p className="text-sm text-slate-400">مؤكدة</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {reconciliations?.filter(r => r.status === "rejected").length || 0}
                  </p>
                  <p className="text-sm text-slate-400">مرفوضة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* التحويلات بانتظار المطابقة */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Unlink className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <CardTitle className="text-white">التحويلات بانتظار المطابقة</CardTitle>
                  <CardDescription>سندات لم يتم مطابقتها بعد</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {unreconciledTransfers && (unreconciledTransfers.outgoing?.length > 0 || unreconciledTransfers.incoming?.length > 0) ? (
                <div className="space-y-4">
                  {/* الصادرة */}
                  {unreconciledTransfers.outgoing?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        سندات صرف صادرة
                      </h4>
                      <div className="space-y-2">
                        {unreconciledTransfers.outgoing.map((voucher: any) => (
                          <div key={voucher.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-yellow-500/20">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                <TrendingDown className="h-5 w-5 text-red-500" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{voucher.voucherNumber}</p>
                                <p className="text-sm text-slate-400">{voucher.destinationName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-left">
                                <p className="font-bold text-red-500">-{parseFloat(voucher.amount).toLocaleString("ar-SA")} {voucher.currency}</p>
                                <p className="text-xs text-slate-500">{new Date(voucher.voucherDate).toLocaleDateString("ar-SA")}</p>
                              </div>
                              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                                <Clock className="h-3 w-3 ml-1" />
                                بانتظار
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* الواردة */}
                  {unreconciledTransfers.incoming?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        سندات قبض واردة
                      </h4>
                      <div className="space-y-2">
                        {unreconciledTransfers.incoming.map((voucher: any) => (
                          <div key={voucher.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-yellow-500/20">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{voucher.voucherNumber}</p>
                                <p className="text-sm text-slate-400">{voucher.sourceName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-left">
                                <p className="font-bold text-green-500">+{parseFloat(voucher.amount).toLocaleString("ar-SA")} {voucher.currency}</p>
                                <p className="text-xs text-slate-500">{new Date(voucher.voucherDate).toLocaleDateString("ar-SA")}</p>
                              </div>
                              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                                <Clock className="h-3 w-3 ml-1" />
                                بانتظار
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500/50 mx-auto mb-4" />
                  <p className="text-slate-400">لا توجد تحويلات بانتظار المطابقة</p>
                  <p className="text-slate-500 text-sm mt-2">جميع التحويلات مطابقة</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* المطابقات المقترحة */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-white">المطابقات المقترحة</CardTitle>
                  <CardDescription>مطابقات تم اكتشافها تلقائياً بانتظار التأكيد</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {reconciliations?.filter(r => r.status === "pending").length > 0 ? (
                <div className="space-y-3">
                  {reconciliations?.filter(r => r.status === "pending").map((rec: any) => (
                    <div key={rec.id} className="p-4 bg-slate-800/30 rounded-lg border border-blue-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            "text-xs",
                            rec.confidenceScore === "high" ? "bg-green-500/20 text-green-500 border-green-500/30" :
                            rec.confidenceScore === "medium" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                            "bg-red-500/20 text-red-500 border-red-500/30"
                          )}>
                            {rec.confidenceScore === "high" ? "ثقة عالية" :
                             rec.confidenceScore === "medium" ? "ثقة متوسطة" : "ثقة منخفضة"}
                          </Badge>
                          <span className="text-lg font-bold text-white">
                            {parseFloat(rec.amount).toLocaleString("ar-SA")} {rec.currency}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                            onClick={() => rejectReconciliationMutation.mutate({ id: rec.id } as any)}
                            disabled={rejectReconciliationMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 ml-1" />
                            رفض
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => confirmReconciliationMutation.mutate({ id: rec.id } as any)}
                            disabled={confirmReconciliationMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 ml-1" />
                            تأكيد
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-400">سند صرف</span>
                          </div>
                          <p className="text-white font-medium">PV-{String(rec.paymentVoucherId).padStart(6, '0')}</p>
                        </div>
                        <div className="flex items-center">
                          <ArrowLeftRight className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex-1 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-400">سند قبض</span>
                          </div>
                          <p className="text-white font-medium">RV-{String(rec.receiptVoucherId).padStart(6, '0')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">لا توجد مطابقات مقترحة</p>
                  <p className="text-slate-500 text-sm mt-2">
                    انقر على "بحث عن مطابقات" للبحث عن سندات متطابقة
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* المطابقات المؤكدة */}
          {reconciliations?.filter(r => r.status === "confirmed").length > 0 && (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-white">المطابقات المؤكدة</CardTitle>
                    <CardDescription>مطابقات تم تأكيدها</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reconciliations?.filter(r => r.status === "confirmed").map((rec: any) => (
                    <div key={rec.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400">PV-{String(rec.paymentVoucherId).padStart(6, '0')}</span>
                          <ArrowLeftRight className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-slate-400">RV-{String(rec.receiptVoucherId).padStart(6, '0')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-white">{parseFloat(rec.amount).toLocaleString("ar-SA")} {rec.currency}</span>
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                          <CheckCircle2 className="h-3 w-3 ml-1" />
                          مؤكد
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
