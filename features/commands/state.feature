Feature: State
  # Save and load state reliably

  Scenario: Save should do nothing when no changes are present
    When I call 'state save'
    Then No stashes exist

  Scenario: Save/Load should save and load my staged files
    Given I append the data 'data' to the file 'file1'
    And I append the data 'data' to the file 'newfile'
    And I add the file 'file1' to the index
    And I add the file 'newfile' to the index

    When I call 'state save'
    Then the repo status should contain the text 'nothing to commit'
    And the repo status should contain the text 'working tree clean'

    When I call 'state load'
    Then the repo status should contain the text 'Changes to be committed'
    And the repo status should contain the text 'file1'
    And the repo status should contain the text 'newfile'

  Scenario: Save/Load should save and load my unstaged files
    Given I append the data 'data' to the file 'file1'
    And I append the data 'data' to the file 'newfile'

    When I call 'state save'
    Then the repo status should contain the text 'nothing to commit'
    And the repo status should contain the text 'working tree clean'

    When I call 'state load'
    Then the repo status should contain the text 'Changes not staged for commit'
    And the repo status should contain the text 'file1'
    And the repo status should contain the text 'newfile'
    And the repo status should contain the text 'no changes added to commit'

  Scenario: Save/Load should save and load my untracked files
    Given I append the data 'data' to the file 'newfile'

    When I call 'state save'
    Then the repo status should contain the text 'nothing to commit'
    And the repo status should contain the text 'working tree clean'

    When I call 'state load'
    Then the repo status should contain the text 'Untracked files'
    And the repo status should contain the text 'newfile'
    And the repo status should contain the text 'nothing added to commit but untracked files present'

  Scenario: Save should do nothing to ignored files
    Given I append the data 'newfile' to the file '.gitignore'
    And I add the file '.gitignore' to the index
    And I commit my changes
    And I append the data 'data' to the file 'newfile'

    When I call 'state save'
    Then No stashes exist

  Scenario: Loading states back-to-back should swap between the two most recent states
    Given I append the data 'firstState' to the file 'file1'
    And I call 'state save'

    When I append the data 'secondState' to the file 'file1'
    And I call 'state load'
    Then the file 'file1' contains the data 'firstState'

    When I call 'state load'
    Then the file 'file1' contains the data 'secondState'

  Scenario: Save/Load state should save and load a detached head
    Given I save the commit hash of the current head to variable 'commitHash'

    When I append the data 'committedData' to the file 'file1'
    And I add the file 'file1' to the index
    And I commit my changes

    When I checkout '${commitHash}'
    And I append the data 'detachedData' to the file 'file1'
    And I call 'state save'
    Then the file 'file1' does not contain the data 'committedData'
    And the file 'file1' does not contain the data 'detachedData'

    When I checkout 'master'
    And I call 'state load'
    Then I am on the detached commit '${commitHash}'
    And the file 'file1' contains the data 'detachedData'
    And the file 'file1' does not contain the data 'committedData'

  Scenario: Loading a state on an older version of the branch should reset the branch head
    # Resetting the branch head is safe if the branch has been pushed to the remote.
    # If someone commits changes to the reset-position, a pull will merge the remote's
    # changes into the local branch
    Given I append the data 'firstState' to the file 'file1'
    And I call 'state save'

    When I append the data 'secondState' to the file 'file1'
    And I add the file 'file1' to the index
    And I commit my changes
    And I push my changes

    When I call 'state load'
    Then the file 'file1' contains the data 'firstState'
    And the file 'file1' does not contain the data 'secondState'

    When I reset my changes to the file 'file1'
    And I pull the latest changes from the remote
    Then the file 'file1' contains the data 'secondState'
    And the file 'file1' does not contain the data 'firstState'

  Scenario: Loading a state should fail if it causes unpushed dangling commits
    # Loading a state will reset the branch head if the state was on an earlier version
    # of the branch. However, if the newest version of the branch only exists locally,
    # this will cause the newest commits to be lost, so instead it fails to load the state.
    Given I append the data 'firstState' to the file 'file1'
    And I call 'state save'

    When I append the data 'secondState' to the file 'file1'
    And I add the file 'file1' to the index
    And I commit my changes

    When I call 'state load'
    Then the file 'file1' contains the data 'secondState'
    And the file 'file1' does not contain the data 'firstState'

  Scenario: I can assign names to my states to load states other than the most recent one.
    # todo

  Scenario: I can list the available states and choose which one to load
    # todo
