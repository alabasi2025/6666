  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    form.reset({
      code: account.code,
      nameAr: account.nameAr,
      nameEn: account.nameEn || "",
      fromSubSystemId: account.fromSubSystemId,
      toSubSystemId: account.toSubSystemId,
      currency: account.currency,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteAccount = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الحساب الوسيط؟")) {
      deleteAccountMutation.mutate({ id } as any);
    }
  };

  const onSubmit = (data: IntermediaryAccountFormValues) => {
    const payload = {
      ...data,
      businessId: 1,
    };

    if (editingAccount) {
      updateAccountMutation.mutate({ id: editingAccount.id, ...payload } as any);
    } else {
      createAccountMutation.mutate(payload);
    }
  };

  // Stats
  const pendingCount = reconciliations?.filter((r: any) => r.status === "pending").length || 0;
  const confirmedCount = reconciliations?.filter((r: any) => r.status === "confirmed").length || 0;

  const isLoading = activeTab === "accounts" ? loadingAccounts : loadingReconciliations;
  const refetch = activeTab === "accounts" ? refetchAccounts : refetchReconciliations;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">الحسابات الوسيطة والمطابقة</h1>
          <p className="text-slate-400">إدارة الحسابات الوسيطة والمطابقة التلقائية بين الأنظمة الفرعية</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => refetch()} className="border-slate-700">
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          {activeTab === "accounts" ? (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingAccount(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Plus className="ml-2 h-4 w-4" />
                  حساب وسيط جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingAccount ? "تعديل الحساب الوسيط" : "حساب وسيط جديد"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    الحساب الوسيط يربط بين نظامين فرعيين لتسهيل التحويلات والمطابقة
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control as any}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">الكود</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="INT-001" className="bg-slate-800 border-slate-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">العملة</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                  <SelectValue placeholder="اختر العملة" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-900 border-slate-800">
                                <SelectItem value="SAR">ريال سعودي</SelectItem>
                                <SelectItem value="USD">دولار أمريكي</SelectItem>
                                <SelectItem value="YER">ريال يمني</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control as any}
                      name="nameAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">الاسم بالعربي</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="حساب وسيط..." className="bg-slate-800 border-slate-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control as any}
                        name="fromSubSystemId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">من نظام</FormLabel>
                            <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                  <SelectValue placeholder="اختر النظام" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-900 border-slate-800">
                                {subSystems?.map((sys: any) => (
                                  <SelectItem key={sys.id} value={sys.id.toString()}>{sys.nameAr}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="toSubSystemId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">إلى نظام</FormLabel>
                            <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                  <SelectValue placeholder="اختر النظام" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-900 border-slate-800">
                                {subSystems?.map((sys: any) => (
                                  <SelectItem key={sys.id} value={sys.id.toString()}>{sys.nameAr}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700">
                        إلغاء
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createAccountMutation.isPending || updateAccountMutation.isPending}
                        className="bg-gradient-to-r from-blue-500 to-purple-600"
                      >
                        {(createAccountMutation.isPending || updateAccountMutation.isPending) && (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        )}
                        {editingAccount ? "تحديث" : "إضافة"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button 
              onClick={() => autoReconcileMutation.mutate({ businessId: 1 } as any)}
              disabled={autoReconcileMutation.isPending}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
            >
              {autoReconcileMutation.isPending ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="ml-2 h-4 w-4" />
              )}
              مطابقة تلقائية
            </Button>
          )}
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <ArrowLeftRight className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-white mb-1">كيف تعمل الحسابات الوسيطة؟</h3>
              <p className="text-slate-400 text-sm">
                عند تحويل مبلغ من نظام فرعي إلى آخر، يتم إنشاء سند صرف في النظام المصدر وسند قبض في النظام الهدف.
                الحساب الوسيط يربط بين السندين ويتم مطابقتهما تلقائياً بناءً على المبلغ والتاريخ.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">الحسابات الوسيطة</p>
                <p className="text-2xl font-bold text-white">{intermediaryAccounts?.length || 0}</p>
              </div>
              <ArrowLeftRight className="h-10 w-10 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm">مطابقات معلقة</p>
                <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm">مطابقات مؤكدة</p>
                <p className="text-2xl font-bold text-green-500">{confirmedCount}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "accounts" | "reconciliations")}>
        <TabsList className="bg-slate-800/50">
          <TabsTrigger value="accounts" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-500">
            <ArrowLeftRight className="ml-2 h-4 w-4" />
            الحسابات الوسيطة ({intermediaryAccounts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="reconciliations" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
            <Link2 className="ml-2 h-4 w-4" />
            المطابقات ({reconciliations?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-4">
          {loadingAccounts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : !intermediaryAccounts || intermediaryAccounts.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="py-12 text-center">
                <ArrowLeftRight className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">لا توجد حسابات وسيطة</p>
                <p className="text-slate-500 text-sm mb-4">قم بإضافة حساب وسيط لربط الأنظمة الفرعية</p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة حساب وسيط
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(intermediaryAccounts as any[]).map((account: any) => (
                <IntermediaryAccountCard
                  key={account.id}
                  account={account}
                  subSystems={subSystems}
                  onEdit={handleEditAccount}
                  onDelete={handleDeleteAccount}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reconciliations" className="mt-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-0">
              {loadingReconciliations ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : !reconciliations || reconciliations.length === 0 ? (
                <div className="py-12 text-center">
                  <Link2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">لا توجد مطابقات</p>
                  <p className="text-slate-500 text-sm mb-4">اضغط على "مطابقة تلقائية" للبحث عن سندات متطابقة</p>
                  <Button 
                    onClick={() => autoReconcileMutation.mutate({ businessId: 1 } as any)}
                    disabled={autoReconcileMutation.isPending}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600"
                  >
                    {autoReconcileMutation.isPending ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="ml-2 h-4 w-4" />
                    )}
                    مطابقة تلقائية
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">#</TableHead>
                      <TableHead className="text-slate-400">السندات</TableHead>
                      <TableHead className="text-slate-400">المبلغ</TableHead>
                      <TableHead className="text-slate-400">نسبة الثقة</TableHead>
                      <TableHead className="text-slate-400">الحالة</TableHead>
                      <TableHead className="text-slate-400 w-24">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(reconciliations as any[]).map((reconciliation: any) => (
                      <ReconciliationRow
                        key={reconciliation.id}
                        reconciliation={reconciliation}
                        onConfirm={(id: number) => confirmReconciliationMutation.mutate({ id } as any)}
                        onReject={(id: number) => rejectReconciliationMutation.mutate({ id } as any)}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
