      <div className="flex items-center justify-center h-screen bg-background">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className={cn("flex h-screen bg-background text-foreground", isDarkMode ? "dark" : "")}>
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 flex flex-col bg-card border-l transition-all duration-300 h-screen",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        {/* Logo with System Switcher */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {sidebarOpen ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent/50 px-2">
                  <Zap className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg">نظام الطاقة</span>
                  <ChevronLeft className="h-4 w-4 rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" sideOffset={5} className="w-56 z-[9999]">
                <DropdownMenuLabel>تبديل النظام</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 bg-accent/50">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>نظام الطاقة</span>
                  <span className="mr-auto text-xs text-muted-foreground">الحالي</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={() => setLocation('/custom')}>
                  <Settings className="h-4 w-4 text-fuchsia-500" />
                  <span>النظام المخصص</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="mx-auto">
                  <Zap className="h-6 w-6 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" sideOffset={5} className="w-56 z-[9999]">
                <DropdownMenuLabel>تبديل النظام</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 bg-accent/50">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>نظام الطاقة</span>
                  <span className="mr-auto text-xs text-muted-foreground">الحالي</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={() => setLocation('/custom')}>
                  <Settings className="h-4 w-4 text-fuchsia-500" />
                  <span>النظام المخصص</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(!sidebarOpen && "mx-auto")}
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2 overflow-y-auto">
          <nav className="px-2 space-y-0.5">
            {navigationItems.map((item, index) => (
              <div key={item.id}>
                {/* Add separator after specific sections */}
                {(index === 1 || index === 4 || index === 8 || index === 11 || index === 14) && sidebarOpen && (
                  <div className="my-3 mx-2 border-t border-border/50" />
                )}
                {item.children ? (
                  <>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 mb-0.5 h-10 transition-all duration-200",
                        "hover:bg-accent/80 hover:translate-x-[-2px]",
                        !sidebarOpen && "justify-center px-2",
                        expandedItems.includes(item.id) && "bg-accent/50"
                      )}
                      onClick={() => toggleExpand(item.id)}
                    >
                      <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", (item as any).color)} />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-right font-medium">{item.title}</span>
                          <ChevronLeft className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            expandedItems.includes(item.id) && "-rotate-90"
                          )} />
                        </>
                      )}
                    </Button>
                    {sidebarOpen && expandedItems.includes(item.id) && (
                      <div className="mr-3 pr-3 space-y-0.5 border-r-2 border-border/30 animate-in slide-in-from-top-2 duration-200">
                        {item.children.map((child) => (
                          child.children ? (
                            // المستوى الثاني - عنصر له أبناء
                            <div key={child.id}>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start gap-3 text-sm h-9 transition-all duration-150",
                                  "hover:translate-x-[-2px]",
                                  expandedItems.includes(child.id) && "bg-accent/30"
                                )}
                                onClick={() => toggleExpand(child.id)}
                              >
                                <child.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="flex-1 text-right">{child.title}</span>
                                <ChevronLeft className={cn(
                                  "h-3 w-3 transition-transform duration-200",
                                  expandedItems.includes(child.id) && "-rotate-90"
                                )} />
                              </Button>
                              {expandedItems.includes(child.id) && (
                                <div className="mr-3 pr-3 space-y-0.5 border-r border-border/20">
                                  {((child as any).children || []).map((subChild: any) => (
                                    subChild.children ? (
                                      // المستوى الثالث - عنصر له أبناء
                                      <div key={subChild.id}>
                                        <Button
                                          variant="ghost"
                                          className={cn(
                                            "w-full justify-start gap-3 text-xs h-8 transition-all duration-150",
                                            "hover:translate-x-[-2px]",
                                            expandedItems.includes(subChild.id) && "bg-accent/20"
                                          )}
                                          onClick={() => toggleExpand(subChild.id)}
                                        >
                                          <subChild.icon className="h-3 w-3 shrink-0 text-muted-foreground" />
                                          <span className="flex-1 text-right">{subChild.title}</span>
                                          <ChevronLeft className={cn(
                                            "h-3 w-3 transition-transform duration-200",
                                            expandedItems.includes(subChild.id) && "-rotate-90"
                                          )} />
                                        </Button>
                                        {expandedItems.includes(subChild.id) && (
                                          <div className="mr-3 pr-3 space-y-0.5 border-r border-border/10">
                                            {((subChild as any).children || []).map((deepChild: any) => (
                                              <Button
                                                key={deepChild.id}
                                                variant={isActivePath(deepChild.path) ? "secondary" : "ghost"}
                                                className={cn(
                                                  "w-full justify-start gap-3 text-xs h-7 transition-all duration-150",
                                                  "hover:translate-x-[-2px]",
                                                  isActivePath(deepChild.path) && "bg-primary/10 text-primary border-r-2 border-primary"
                                                )}
                                                onClick={() => handleNavigation(deepChild.path)}
                                              >
                                                <deepChild.icon className={cn(
                                                  "h-3 w-3 shrink-0",
                                                  isActivePath(deepChild.path) ? "text-primary" : "text-muted-foreground"
                                                )} />
                                                <span>{deepChild.title}</span>
                                              </Button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      // المستوى الثالث - عنصر نهائي
                                      <Button
                                        key={subChild.id}
                                        variant={isActivePath(subChild.path) ? "secondary" : "ghost"}
                                        className={cn(
                                          "w-full justify-start gap-3 text-xs h-8 transition-all duration-150",
                                          "hover:translate-x-[-2px]",
                                          isActivePath(subChild.path) && "bg-primary/10 text-primary border-r-2 border-primary"
                                        )}
                                        onClick={() => handleNavigation(subChild.path)}
                                      >
                                        <subChild.icon className={cn(
                                          "h-3 w-3 shrink-0",
                                          isActivePath(subChild.path) ? "text-primary" : "text-muted-foreground"
                                        )} />
                                        <span>{subChild.title}</span>
                                      </Button>
                                    )
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            // المستوى الثاني - عنصر نهائي
                            <Button
                              key={child.id}
                              variant={isActivePath(child.path) ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start gap-3 text-sm h-9 transition-all duration-150",
                                "hover:translate-x-[-2px]",
                                isActivePath(child.path) && "bg-primary/10 text-primary border-r-2 border-primary"
                              )}
                              onClick={() => handleNavigation(child.path)}
                            >
                              <child.icon className={cn(
                                "h-4 w-4 shrink-0",
                                isActivePath(child.path) ? "text-primary" : "text-muted-foreground"
                              )} />
                              <span>{child.title}</span>
                            </Button>
                          )
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Button
                    variant={isActivePath(item.path!) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-10 transition-all duration-200",
                      "hover:bg-accent/80 hover:translate-x-[-2px]",
                      !sidebarOpen && "justify-center px-2",
                      isActivePath(item.path!) && "bg-primary/10 text-primary border-r-2 border-primary"
                    )}
                    onClick={() => handleNavigation(item.path!)}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0", (item as any).color)} />
                    {sidebarOpen && <span className="font-medium">{item.title}</span>}
                  </Button>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* User Menu */}
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn(
                "w-full justify-start gap-3",
                !sidebarOpen && "justify-center px-2"
              )}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name?.charAt(0) || "م"}
                  </AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{user?.name || "مستخدم تجريبي"}</span>
                    <span className="text-muted-foreground text-xs">{user?.role || "مستخدم"}</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="h-4 w-4 ml-2" /> : <Moon className="h-4 w-4 ml-2" />}
                {isDarkMode ? "الوضع الفاتح" : "الوضع الداكن"}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 ml-2" />
                الإعدادات
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="h-4 w-4 ml-2" />
                المساعدة
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen ? "mr-64" : "mr-16"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-card border-b">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث..."
                className="w-64 h-9 pr-10 pl-4 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* System Switcher Icon */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation('/custom')}
              className="relative group"
              title="الانتقال للنظام المخصص"
            >
              <Settings className="h-5 w-5 text-fuchsia-500 group-hover:rotate-90 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
