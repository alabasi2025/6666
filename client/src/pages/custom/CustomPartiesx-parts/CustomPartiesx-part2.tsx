                  return (
                    <TableRow key={party.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell className="font-mono text-slate-300">{party.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className={cn("h-4 w-4", typeConfig.color)} />
                          <div>
                            <p className="font-medium text-white">{party.nameAr}</p>
                            {party.nameEn && (
                              <p className="text-xs text-slate-400">{party.nameEn}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("border-slate-600", typeConfig.color)}>
                          {typeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {party.mobile || party.phone || "-"}
                      </TableCell>
                      <TableCell className="text-slate-300">{party.city || "-"}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-medium",
                          balance > 0 ? "text-green-500" : balance < 0 ? "text-red-500" : "text-slate-400"
                        )}>
                          {formatBalance(balance)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={party.isActive ? "default" : "secondary"}>
                          {party.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewStatement(party)}>
                              <FileText className="h-4 w-4 ml-2" />
                              كشف حساب
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(party)}>
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(party.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* نافذة إضافة/تعديل طرف */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingParty ? "تعديل طرف" : "إضافة طرف جديد"}
            </DialogTitle>
            <DialogDescription>
              {editingParty ? "قم بتعديل بيانات الطرف" : "أدخل بيانات الطرف الجديد"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* البيانات الأساسية */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الكود *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: C001" className="bg-slate-900/50 border-slate-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الطرف *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-900/50 border-slate-600">
                            <SelectValue placeholder="اختر النوع" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {partyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className={cn("h-4 w-4", type.color)} />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم بالعربية *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="الاسم بالعربية" className="bg-slate-900/50 border-slate-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم بالإنجليزية</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Name in English" className="bg-slate-900/50 border-slate-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* بيانات التواصل */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">بيانات التواصل</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الهاتف</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="رقم الهاتف" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الجوال</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="رقم الجوال" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="example@email.com" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>جهة الاتصال</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="اسم جهة الاتصال" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* العنوان */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">العنوان</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المدينة</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="المدينة" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الدولة</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="الدولة" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>العنوان التفصيلي</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="العنوان بالتفصيل" className="bg-slate-900/50 border-slate-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* البيانات التجارية */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">البيانات التجارية</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="taxNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الرقم الضريبي</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="الرقم الضريبي" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="commercialRegister"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السجل التجاري</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="رقم السجل التجاري" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="creditLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حد الائتمان</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="0" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العملة</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-900/50 border-slate-600">
                              <SelectValue placeholder="اختر العملة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                            <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                            <SelectItem value="EUR">يورو (EUR)</SelectItem>
                            <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* ملاحظات */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="ملاحظات إضافية..." className="bg-slate-900/50 border-slate-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  )}
                  {editingParty ? "تحديث" : "إنشاء"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* نافذة كشف الحساب */}
      <Dialog open={isStatementDialogOpen} onOpenChange={setIsStatementDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              كشف حساب: {selectedParty?.nameAr}
            </DialogTitle>
            <DialogDescription>
              الرصيد الحالي: {formatBalance(selectedParty?.currentBalance || 0)}
            </DialogDescription>
          </DialogHeader>

          {statement.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد حركات لهذا الطرف</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">المرجع</TableHead>
                  <TableHead className="text-right">مدين</TableHead>
                  <TableHead className="text-right">دائن</TableHead>
                  <TableHead className="text-right">الرصيد</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statement.map((tx: any) => (
                  <TableRow key={tx.id} className="border-slate-700">
                    <TableCell className="text-slate-300">
                      {format(new Date(tx.transactionDate), "yyyy/MM/dd", { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tx.transactionType}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{tx.referenceNumber || "-"}</TableCell>
                    <TableCell className="text-red-500">
                      {tx.transactionType === "payment" ? formatBalance(tx.amount) : "-"}
                    </TableCell>
                    <TableCell className="text-green-500">
                      {tx.transactionType === "receipt" ? formatBalance(tx.amount) : "-"}
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {formatBalance(tx.balanceAfter)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatementDialogOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
