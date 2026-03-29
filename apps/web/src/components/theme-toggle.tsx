"use client";

import * as React from "react";
import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@saas-template/ui";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? (resolvedTheme ?? "dark") : "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative gap-2"
          aria-label="Toggle theme"
        >
          {activeTheme === "light" ? (
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          ) : (
            <Moon className="size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          )}
          <span className="sr-only">Toggle theme</span>
          <span className="ml-4 capitalize">{activeTheme}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="justify-between"
        >
          Light
          {activeTheme === "light" ? <Check className="size-4" /> : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="justify-between"
        >
          Dark
          {activeTheme === "dark" ? <Check className="size-4" /> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
