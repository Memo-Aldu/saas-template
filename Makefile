# Config
ifeq ($(OS),Windows_NT)
SHELL         := cmd
.SHELLFLAGS   := /C
PYTHON        ?= $(if $(wildcard .venv/Scripts/python.exe),.venv\Scripts\python.exe,python)
UV            ?= $(if $(wildcard .venv/Scripts/uv.exe),.venv\Scripts\uv.exe,uv)
else
PYTHON        ?= $(if $(wildcard .venv/bin/python),.venv/bin/python,python3)
UV            ?= $(if $(wildcard .venv/bin/uv),.venv/bin/uv,uv)
endif
DIST_DIR      := dist
WHEELS_DIR    := $(DIST_DIR)/wheels
UV_CACHE_DIR  := $(DIST_DIR)/.uv-cache
LAMBDA_PLATFORM ?= manylinux2014_x86_64
LAMBDA_PYTHON_VERSION ?= 3.13

# Default
.PHONY: all
all: help

.PHONY: help
help:
	@echo ""
	@echo "Usage: make <target> [SERVICE=<service-dir>]"
	@echo ""
	@echo "  sync              Install all workspace deps (run after clone / pyproject changes)"
	@echo "  build-wheels      Build local packages as wheels into $(WHEELS_DIR)/"
	@echo "  package           Build a Lambda zip for a service"
	@echo "                    Example: make package SERVICE=services/skeleton-lambda-rest"
	@echo "  clean             Remove all build artifacts"
	@echo ""

# Sync workspace
.PHONY: sync
sync:
	$(UV) sync --all-packages

# Build local packages as real wheels.
.PHONY: build-wheels
build-wheels:
	$(PYTHON) -c "from pathlib import Path; Path(r'$(WHEELS_DIR)').mkdir(parents=True, exist_ok=True); Path(r'$(UV_CACHE_DIR)').mkdir(parents=True, exist_ok=True)"
	@echo "Building packages/python/shared-core"
	$(UV) --cache-dir $(UV_CACHE_DIR) build packages/python/shared-core --wheel --out-dir $(WHEELS_DIR)
	@echo "Building packages/python/aws-utils"
	$(UV) --cache-dir $(UV_CACHE_DIR) build packages/python/aws-utils --wheel --out-dir $(WHEELS_DIR)
	@echo "Building packages/python/domain-models"
	$(UV) --cache-dir $(UV_CACHE_DIR) build packages/python/domain-models --wheel --out-dir $(WHEELS_DIR)

# Package a single Lambda service.
# Usage: make package SERVICE=services/skeleton-lambda-rest
#
# Produces: dist/<service-name>.zip ready to upload to AWS Lambda.
.PHONY: package
package: build-wheels
ifndef SERVICE
	$(error SERVICE is not set. Usage: make package SERVICE=services/skeleton-lambda-rest)
endif
	$(eval SERVICE_NAME := $(notdir $(SERVICE)))
	$(eval STAGING      := $(DIST_DIR)/$(SERVICE_NAME))
	$(eval ZIPFILE      := $(DIST_DIR)/$(SERVICE_NAME).zip)

	@echo "Packaging $(SERVICE_NAME)"
	$(PYTHON) -c "import shutil; from pathlib import Path; shutil.rmtree(r'$(STAGING)', ignore_errors=True); Path(r'$(STAGING)').mkdir(parents=True, exist_ok=True)"
	$(UV) --cache-dir $(UV_CACHE_DIR) export \
		--no-dev \
		--no-editable \
		--no-sources \
		--package $(SERVICE_NAME) \
		-o $(STAGING)/requirements.txt
	$(PYTHON) -c "from pathlib import Path; src=Path(r'$(STAGING)/requirements.txt'); dst=Path(r'$(STAGING)/requirements.external.txt'); lines=src.read_text(encoding='utf-8').splitlines(); keep=[]; [keep.append(line) for line in lines if not line.strip().startswith('./') and not line.strip().startswith('file://')]; dst.write_text('\n'.join(keep) + '\n', encoding='utf-8')"
	$(PYTHON) -m pip install \
		--quiet \
		--require-hashes \
		--only-binary=:all: \
		--platform $(LAMBDA_PLATFORM) \
		--implementation cp \
		--python-version $(LAMBDA_PYTHON_VERSION) \
		-r $(STAGING)/requirements.external.txt \
		-t $(STAGING)
	$(PYTHON) -c "import subprocess, sys; from pathlib import Path; req=Path(r'$(STAGING)/requirements.txt').read_text(encoding='utf-8').splitlines(); local_pkgs=[]; [local_pkgs.append(Path(line.strip()).name) for line in req if line.strip().startswith('./packages/python/') and Path(line.strip()).name not in local_pkgs]; cmd=[sys.executable, '-m', 'pip', 'install', '--quiet', '--no-deps', '--no-index', '--find-links', r'$(WHEELS_DIR)', '-t', r'$(STAGING)', *local_pkgs]; subprocess.check_call(cmd) if local_pkgs else None"
	$(PYTHON) -c "import shutil; from pathlib import Path; src=Path(r'$(SERVICE)') / 'src'; dst=Path(r'$(STAGING)'); [shutil.copytree(p, dst / p.name, dirs_exist_ok=True) if p.is_dir() else shutil.copy2(p, dst / p.name) for p in src.iterdir()]"
	$(PYTHON) -c "import shutil; from pathlib import Path; root=Path(r'$(STAGING)'); [shutil.rmtree(p, ignore_errors=True) for p in root.rglob('__pycache__') if p.is_dir()]; [shutil.rmtree(p, ignore_errors=True) for p in root.rglob('tests') if p.is_dir()]; [shutil.rmtree(p, ignore_errors=True) for p in root.rglob('test') if p.is_dir()]; [p.unlink(missing_ok=True) for p in root.rglob('*.pyc') if p.is_file()]; [p.unlink(missing_ok=True) for p in root.rglob('*.pyo') if p.is_file()]"
	$(PYTHON) -c "from pathlib import Path; [Path(r'$(STAGING)', name).unlink(missing_ok=True) for name in ('requirements.txt', 'requirements.external.txt')]"
	$(PYTHON) -c "import zipfile; from pathlib import Path; staging=Path(r'$(STAGING)'); zip_path=Path(r'$(ZIPFILE)'); zip_path.parent.mkdir(parents=True, exist_ok=True); zip_path.unlink(missing_ok=True); files=sorted([p for p in staging.rglob('*') if p.is_file()]); zf=zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED); [zf.write(p, p.relative_to(staging)) for p in files]; zf.close()"

	@echo "Artifact: $(ZIPFILE)"

# Clean
.PHONY: clean
clean:
	$(PYTHON) -c "import shutil; from pathlib import Path; shutil.rmtree(r'$(DIST_DIR)', ignore_errors=True); [shutil.rmtree(p, ignore_errors=True) for p in Path('.').rglob('__pycache__') if p.is_dir()]; [shutil.rmtree(p, ignore_errors=True) for p in Path('.').rglob('*.egg-info') if p.is_dir()]"
