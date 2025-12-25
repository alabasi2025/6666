                  )}
                />
                <FormField
                  control={receiptForm.control as any}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">المبلغ</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} placeholder="0.00" className="bg-slate-800 border-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={receiptForm.control as any}
                name="sourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">نوع المصدر (من)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="اختر نوع المصدر" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {sourceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchReceiptSourceType === "intermediary" ? (
                <FormField
                  control={receiptForm.control as any}
                  name="sourceIntermediaryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">الحساب الوسيط</FormLabel>
                      <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-800 border-slate-700">
                            <SelectValue placeholder="اختر الحساب الوسيط" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-slate-800">
                          {intermediaryAccounts?.map((acc: any) => (
                            <SelectItem key={acc.id} value={acc.id.toString()}>{acc.nameAr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={receiptForm.control as any}
                  name="sourceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">اسم المصدر</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="اسم الشخص أو الجهة" className="bg-slate-800 border-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={receiptForm.control as any}
                name="treasuryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">الخزينة (إلى)</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="اختر الخزينة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {treasuries?.map((treasury: any) => (
                          <SelectItem key={(treasury as any).id} value={(treasury as any).id.toString()}>
                            {(treasury as any).nameAr} ({(treasury as any).currentBalance} {(treasury as any).currency})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={receiptForm.control as any}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">البيان</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="وصف السند..." className="bg-slate-800 border-slate-700" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700">
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={createReceiptMutation.isPending || updateReceiptMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  {(createReceiptMutation.isPending || updateReceiptMutation.isPending) && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  {editingVoucher ? "تحديث" : "إضافة"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Payment Voucher */}
      <Dialog open={isDialogOpen && activeTab === "payment"} onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false);
          setEditingVoucher(null);
          paymentForm.reset();
        }
      }}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-red-500" />
              {editingVoucher ? "تعديل سند الصرف" : "سند صرف جديد"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingVoucher ? "قم بتعديل بيانات سند الصرف" : "أدخل بيانات سند الصرف الجديد"}
            </DialogDescription>
          </DialogHeader>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={paymentForm.control as any}
                  name="voucherDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">التاريخ</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-slate-800 border-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={paymentForm.control as any}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">المبلغ</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} placeholder="0.00" className="bg-slate-800 border-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={paymentForm.control as any}
                name="treasuryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">الخزينة (من)</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="اختر الخزينة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {treasuries?.map((treasury: any) => (
                          <SelectItem key={(treasury as any).id} value={(treasury as any).id.toString()}>
                            {(treasury as any).nameAr} ({(treasury as any).currentBalance} {(treasury as any).currency})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control as any}
                name="destinationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">نوع الوجهة (إلى)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="اختر نوع الوجهة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {sourceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchPaymentDestType === "intermediary" ? (
                <FormField
                  control={paymentForm.control as any}
                  name="destinationIntermediaryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">الحساب الوسيط</FormLabel>
                      <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-800 border-slate-700">
                            <SelectValue placeholder="اختر الحساب الوسيط" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-slate-800">
                          {intermediaryAccounts?.map((acc: any) => (
                            <SelectItem key={acc.id} value={acc.id.toString()}>{acc.nameAr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={paymentForm.control as any}
                  name="destinationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">اسم الوجهة</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="اسم الشخص أو الجهة" className="bg-slate-800 border-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={paymentForm.control as any}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">البيان</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="وصف السند..." className="bg-slate-800 border-slate-700" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700">
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPaymentMutation.isPending || updatePaymentMutation.isPending}
                  className="bg-gradient-to-r from-red-500 to-rose-600"
                >
                  {(createPaymentMutation.isPending || updatePaymentMutation.isPending) && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  {editingVoucher ? "تحديث" : "إضافة"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
