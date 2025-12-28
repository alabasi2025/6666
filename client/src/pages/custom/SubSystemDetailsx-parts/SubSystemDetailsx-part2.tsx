  const resetTreasuryForm = () => {
    setNewTreasury({
      code: "",
      nameAr: "",
      nameEn: "",
      treasuryType: "cash",
      bankName: "",
      accountNumber: "",
      iban: "",
      walletProvider: "",
      walletNumber: "",
      currency: "SAR",
      openingBalance: "0",
      description: "",
    });
  };

  const resetTransferForm = () => {
    setNewTransfer({
      toSubSystemId: 0,
      fromTreasuryId: 0,
      toTreasuryId: 0,
      amount: "",
      description: "",
    });
  };

  const handleCreateTransfer = () => {
    if (!newTransfer.toSubSystemId || !newTransfer.fromTreasuryId || !newTransfer.toTreasuryId || !newTransfer.amount) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    createTransferMutation.mutate({
      businessId: 1,
      fromSubSystemId: parseInt(id || "0"),
      toSubSystemId: newTransfer.toSubSystemId,
      fromTreasuryId: newTransfer.fromTreasuryId,
      toTreasuryId: newTransfer.toTreasuryId,
      amount: newTransfer.amount,
      description: newTransfer.description,
      transferDate: new Date().toISOString().split("T")[0],
    } as any);
  };

  const resetVoucherForm = () => {
    setNewVoucher({
      amount: "",
      sourceType: "person",
      sourceName: "",
      sourceIntermediaryId: undefined,
      destinationType: "person",
      destinationName: "",
      destinationIntermediaryId: undefined,
      treasuryId: 0,
      description: "",
    });
  };

  // Handlers
  const handleCreateTreasury = () => {
    createTreasuryMutation.mutate({
      businessId: 1,
      subSystemId: parseInt(id || "0"),
      ...newTreasury,
    } as any);
  };

  const handleCreateVoucher = () => {
    if (voucherType === "receipt") {
      createReceiptMutation.mutate({
        businessId: 1,
        subSystemId: parseInt(id || "0"),
        amount: newVoucher.amount,
        sourceType: newVoucher.sourceType,
        sourceName: newVoucher.sourceName,
        sourceIntermediaryId: newVoucher.sourceIntermediaryId,
        treasuryId: newVoucher.treasuryId,
        description: newVoucher.description,
      } as any);
    } else {
      createPaymentMutation.mutate({
        businessId: 1,
        subSystemId: parseInt(id || "0"),
        amount: newVoucher.amount,
        destinationType: newVoucher.destinationType,
        destinationName: newVoucher.destinationName,
        destinationIntermediaryId: newVoucher.destinationIntermediaryId,
        treasuryId: newVoucher.treasuryId,
        description: newVoucher.description,
      } as any);
    }
  };

  const handleDeleteTreasury = (treasuryId: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الخزينة؟")) {
      deleteTreasuryMutation.mutate({ id: treasuryId } as any);
    }
  };

  // Calculate Stats
  const totalBalance = treasuries?.reduce((sum: number, t: any) => sum + parseFloat(t.currentBalance || "0"), 0) || 0;
  const totalReceipts = receiptVouchers?.filter((v: any) => v.status === "confirmed").reduce((sum: number, v: any) => sum + parseFloat(v.amount), 0) || 0;
  const totalPayments = paymentVouchers?.filter((v: any) => v.status === "confirmed").reduce((sum: number, v: any) => sum + parseFloat(v.amount), 0) || 0;

  // Get related intermediary accounts for this sub system
  const relatedIntermediaryAccounts = intermediaryAccounts?.filter(
    (acc: any) => acc.fromSubSystemId === parseInt(id || "0") || acc.toSubSystemId === parseInt(id || "0")
  ) || [];

  if (subSystemLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!subSystem) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-400">النظام الفرعي غير موجود</p>
        <Button onClick={() => setLocation("/custom-system/sub-systems")} className="mt-4">
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للأنظمة الفرعية
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/custom-system/sub-systems")}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{subSystem.nameAr}</h1>
            <p className="text-slate-400">{subSystem.code} {subSystem.nameEn && `• ${subSystem.nameEn}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => {
            refetchSubSystem();
            refetchTreasuries();
            refetchReceipts();
            refetchPayments();
          }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Settings className="ml-2 h-4 w-4" />
            إعدادات النظام
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-400">إجمالي الرصيد</p>
                <p className="text-2xl font-bold text-white">{totalBalance.toLocaleString("ar-SA")} ر.س</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400">إجمالي القبض</p>
                <p className="text-2xl font-bold text-white">{totalReceipts.toLocaleString("ar-SA")} ر.س</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400">إجمالي الصرف</p>
                <p className="text-2xl font-bold text-white">{totalPayments.toLocaleString("ar-SA")} ر.س</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-400">عدد الخزائن</p>
                <p className="text-2xl font-bold text-white">{treasuries?.length || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-slate-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary">
            <Wallet className="ml-2 h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="treasuries" className="data-[state=active]:bg-primary">
            <Building2 className="ml-2 h-4 w-4" />
            الخزائن
          </TabsTrigger>
          <TabsTrigger value="vouchers" className="data-[state=active]:bg-primary">
            <Receipt className="ml-2 h-4 w-4" />
            السندات
          </TabsTrigger>
          <TabsTrigger value="transfers" className="data-[state=active]:bg-primary">
            <ArrowLeftRight className="ml-2 h-4 w-4" />
            التحويلات
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="data-[state=active]:bg-primary">
            <FileCheck className="ml-2 h-4 w-4" />
            المطابقة
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Receipts */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">آخر سندات القبض</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("vouchers")}>
                    عرض الكل
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {receiptVouchers?.slice(0, 5).map((voucher: any) => (
                  <VoucherRow key={voucher.id} voucher={voucher} type="receipt" onView={() => {}} />
                ))}
                {(!receiptVouchers || receiptVouchers.length === 0) && (
                  <p className="text-center text-slate-400 py-4">لا توجد سندات قبض</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">آخر سندات الصرف</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("vouchers")}>
                    عرض الكل
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {paymentVouchers?.slice(0, 5).map((voucher: any) => (
                  <VoucherRow key={voucher.id} voucher={voucher} type="payment" onView={() => {}} />
                ))}
                {(!paymentVouchers || paymentVouchers.length === 0) && (
                  <p className="text-center text-slate-400 py-4">لا توجد سندات صرف</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Intermediary Accounts */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">الحسابات الوسيطة المرتبطة</CardTitle>
              <CardDescription>حسابات التحويل بين هذا النظام والأنظمة الأخرى</CardDescription>
            </CardHeader>
            <CardContent>
              {relatedIntermediaryAccounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedIntermediaryAccounts.map((acc: any) => {
                    const isFrom = acc.fromSubSystemId === parseInt(id || "0");
                    const otherSystem = allSubSystems?.find((s: any) => 
                      s.id === (isFrom ? acc.toSubSystemId : acc.fromSubSystemId)
                    );
                    
                    return (
                      <div key={acc.id} className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowLeftRight className="h-4 w-4 text-purple-500" />
                          <span className="font-medium text-white">{acc.nameAr}</span>
                        </div>
                        <p className="text-sm text-slate-400">
                          {isFrom ? "إلى" : "من"}: {otherSystem?.nameAr || "غير معروف"}
                        </p>
                        <p className={cn(
                          "text-lg font-bold mt-2",
                          parseFloat(acc.balance) >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {parseFloat(acc.balance).toLocaleString("ar-SA")} {acc.currency}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-4">لا توجد حسابات وسيطة مرتبطة</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treasuries Tab */}
        <TabsContent value="treasuries" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">الخزائن</h2>
            <Dialog open={isAddTreasuryOpen} onOpenChange={setIsAddTreasuryOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة خزينة
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
                <DialogHeader>
                  <DialogTitle>إضافة خزينة جديدة</DialogTitle>
                  <DialogDescription>أضف خزينة جديدة لهذا النظام الفرعي</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الكود</Label>
                      <Input
                        value={newTreasury.code}
                        onChange={(e) => setNewTreasury({ ...newTreasury, code: e.target.value })}
                        placeholder="CASH-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>نوع الخزينة</Label>
                      <Select
                        value={newTreasury.treasuryType}
                        onValueChange={(v: any) => setNewTreasury({ ...newTreasury, treasuryType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">صندوق نقدي</SelectItem>
                          <SelectItem value="bank">حساب بنكي</SelectItem>
                          <SelectItem value="wallet">محفظة إلكترونية</SelectItem>
                          <SelectItem value="exchange">صراف</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الاسم بالعربي</Label>
                      <Input
                        value={newTreasury.nameAr}
                        onChange={(e) => setNewTreasury({ ...newTreasury, nameAr: e.target.value })}
                        placeholder="الصندوق الرئيسي"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الاسم بالإنجليزي</Label>
                      <Input
                        value={newTreasury.nameEn}
                        onChange={(e) => setNewTreasury({ ...newTreasury, nameEn: e.target.value })}
                        placeholder="Main Cash"
                      />
                    </div>
                  </div>
                  
                  {newTreasury.treasuryType === "bank" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>اسم البنك</Label>
                          <Input
                            value={newTreasury.bankName}
                            onChange={(e) => setNewTreasury({ ...newTreasury, bankName: e.target.value })}
                            placeholder="البنك الأهلي"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>رقم الحساب</Label>
                          <Input
                            value={newTreasury.accountNumber}
                            onChange={(e) => setNewTreasury({ ...newTreasury, accountNumber: e.target.value })}
                            placeholder="1234567890"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>IBAN</Label>
                        <Input
                          value={newTreasury.iban}
                          onChange={(e) => setNewTreasury({ ...newTreasury, iban: e.target.value })}
                          placeholder="SA..."
                        />
                      </div>
                    </>
