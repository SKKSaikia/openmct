define(
    [
        '../../../commonUI/edit/src/representers/EditToolbar'
    ],
    function (EditToolbar) {

        // Default ng-pattern; any non whitespace
        var NON_WHITESPACE = /\S/;

        /**
         * Controller for mct-toolbar directive.
         *
         * @memberof platform/forms
         * @constructor
         */
        function ToolbarController($scope, openmct) {
            var regexps = [];
            var self = this;

            // ng-pattern seems to want a RegExp, and not a
            // string (despite what documentation says) but
            // we want toolbar structure to be JSON-expressible,
            // so we make RegExp's from strings as-needed
            function getRegExp(pattern) {
                // If undefined, don't apply a pattern
                if (!pattern) {
                    return NON_WHITESPACE;
                }

                // Just echo if it's already a regexp
                if (pattern instanceof RegExp) {
                    return pattern;
                }

                // Otherwise, assume a string
                // Cache for easy lookup later (so we don't
                // creat a new RegExp every digest cycle)
                if (!regexps[pattern]) {
                    regexps[pattern] = new RegExp(pattern);
                }

                return regexps[pattern];
            }

            this.openmct = openmct;
            this.$scope = $scope;
            $scope.editToolbar = {};
            $scope.getRegExp = getRegExp;

            $scope.$on("$destroy", function () {
                self.openmct.selection.off("change", self.handleSelection);
            });

            openmct.selection.on('change', this.handleSelection.bind(this));
        }

        ToolbarController.prototype.handleSelection = function (selection) {
            if (selection[0].context.oldItem === this.selectedItem) {
                return;
            }

            this.selectedItem = selection[0].context.oldItem;

            if (this.editToolbar) {
                this.editToolbar.destroy();
            }

            var structure = this.openmct.toolbars.get(selection) || [];
            this.editToolbar = new EditToolbar(this.$scope, this.openmct, structure);
            this.$scope.$parent.editToolbar = this.editToolbar;
            this.$scope.$parent.editToolbar.structure = this.editToolbar.getStructure();
            this.$scope.$parent.editToolbar.state = this.editToolbar.getState();
        };

        return ToolbarController;
    }
);
